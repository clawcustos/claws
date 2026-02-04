// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Claws
 * @notice Speculation market for AI agent reputation
 * @dev Bonding curve mechanics with speculator-created markets
 * 
 * Flow:
 * 1. Anyone can create market for moltbook/X verified agent
 * 2. Market creator buys first claw, opens speculation
 * 3. Trading happens, fees accumulate for agent
 * 4. Agent verifies on claws.tech → claims free reserved claw + accumulated fees
 * 5. Agent earns 5% on all future trades
 *
 * Supply cap: ~2.6e8 claws per agent before overflow (sum of cubes formula)
 * This is practically unreachable but documented for auditors.
 */
contract Claws is ReentrancyGuard, Pausable {
    // ============ State ============

    /// @notice Total claws supply for each agent
    mapping(address => uint256) public clawsSupply;

    /// @notice Claw balance for each holder per agent
    mapping(address => mapping(address => uint256)) public clawsBalance;

    /// @notice Agent verified on external source (moltbook/X) - allows market creation
    mapping(address => bool) public sourceVerified;

    /// @notice Agent verified on claws.tech - enables fee claims
    mapping(address => bool) public clawsVerified;

    /// @notice Agent has been revoked (compromised account, etc)
    mapping(address => bool) public revoked;

    /// @notice Agent has claimed their reserved free claw
    mapping(address => bool) public reservedClawClaimed;

    /// @notice Accumulated fees before agent verifies on claws.tech
    mapping(address => uint256) public pendingFees;

    /// @notice Agent's X handle for display
    mapping(address => string) public agentXHandle;

    /// @notice Agent's moltbook ID for reference
    mapping(address => string) public agentMoltbookId;

    /// @notice Protocol fee percentage (in wei, 5e16 = 5%)
    uint256 public protocolFeePercent = 50000000000000000;

    /// @notice Agent fee percentage (in wei, 5e16 = 5%)
    uint256 public agentFeePercent = 50000000000000000;

    /// @notice Protocol fee destination
    address public protocolFeeDestination;

    /// @notice Contract owner
    address public owner;

    /// @notice Verifier role - can add source-verified agents
    address public verifier;

    // ============ Events ============

    event AgentSourceVerified(address indexed agent, string xHandle, string moltbookId);
    event AgentClawsVerified(address indexed agent);
    event AgentRevoked(address indexed agent, string reason);
    event AgentUnrevoked(address indexed agent);
    event ReservedClawClaimed(address indexed agent);
    event FeesClaimed(address indexed agent, uint256 amount);
    event MarketCreated(address indexed agent, address indexed creator);
    event VerifierUpdated(address indexed newVerifier);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ProtocolFeeDestinationUpdated(address indexed newDestination);
    event FeesUpdated(uint256 protocolFee, uint256 agentFee);

    event Trade(
        address indexed trader,
        address indexed agent,
        bool isBuy,
        uint256 clawAmount,
        uint256 ethAmount,
        uint256 protocolFee,
        uint256 agentFee,
        uint256 newSupply
    );

    // ============ Errors ============

    error NotOwner();
    error NotVerifier();
    error NotAgent();
    error AgentNotSourceVerified();
    error AgentNotClawsVerified();
    error AgentIsRevoked();
    error AlreadyClaimed();
    error NoMarketExists();
    error MarketAlreadyExists();
    error InsufficientPayment();
    error InsufficientClaws();
    error CannotSellLastClaw();
    error TransferFailed();
    error FeesTooHigh();
    error ZeroAddress();
    error NoPendingFees();
    error SlippageExceeded();
    error ZeroAmount();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyVerifier() {
        if (msg.sender != verifier && msg.sender != owner) revert NotVerifier();
        _;
    }

    // ============ Constructor ============

    constructor(address _protocolFeeDestination, address _verifier) {
        if (_protocolFeeDestination == address(0)) revert ZeroAddress();
        owner = msg.sender;
        protocolFeeDestination = _protocolFeeDestination;
        verifier = _verifier == address(0) ? msg.sender : _verifier;
    }

    // ============ Source Verification (Moltbook/X) ============

    /**
     * @notice Mark an agent as verified on external source (moltbook/X)
     * @dev Called by verifier after confirming agent identity off-chain
     * @param agent The agent's wallet address
     * @param xHandle The agent's X/Twitter handle
     * @param moltbookId The agent's moltbook ID (optional)
     */
    function addSourceVerifiedAgent(
        address agent, 
        string calldata xHandle,
        string calldata moltbookId
    ) external onlyVerifier {
        if (agent == address(0)) revert ZeroAddress();
        sourceVerified[agent] = true;
        agentXHandle[agent] = xHandle;
        agentMoltbookId[agent] = moltbookId;
        emit AgentSourceVerified(agent, xHandle, moltbookId);
    }

    /**
     * @notice Batch add source-verified agents
     * @param agents Array of agent addresses
     * @param xHandles Array of X handles
     * @param moltbookIds Array of moltbook IDs
     */
    function addSourceVerifiedAgentBatch(
        address[] calldata agents,
        string[] calldata xHandles,
        string[] calldata moltbookIds
    ) external onlyVerifier {
        for (uint256 i = 0; i < agents.length; i++) {
            if (agents[i] == address(0)) revert ZeroAddress();
            sourceVerified[agents[i]] = true;
            agentXHandle[agents[i]] = xHandles[i];
            agentMoltbookId[agents[i]] = moltbookIds[i];
            emit AgentSourceVerified(agents[i], xHandles[i], moltbookIds[i]);
        }
    }

    /**
     * @notice Revoke an agent's verification (compromised account, abuse, etc)
     * @dev Prevents new market creation and fee claims. Existing markets can still trade.
     * @param agent The agent's wallet address
     * @param reason Human-readable reason for revocation
     */
    function revokeAgent(address agent, string calldata reason) external onlyVerifier {
        revoked[agent] = true;
        emit AgentRevoked(agent, reason);
    }

    /**
     * @notice Un-revoke an agent (false positive, issue resolved, etc)
     * @param agent The agent's wallet address
     */
    function unrevokeAgent(address agent) external onlyVerifier {
        revoked[agent] = false;
        emit AgentUnrevoked(agent);
    }

    // ============ Agent Verification (Claws.tech) ============

    /**
     * @notice Agent verifies on claws.tech to claim reserved claw and enable fees
     * @dev Agent must call this themselves (proves wallet ownership)
     */
    function verifyAndClaim() external nonReentrant whenNotPaused {
        address agent = msg.sender;
        
        // Must not be revoked
        if (revoked[agent]) revert AgentIsRevoked();
        
        // Must have a market (someone bought claws)
        if (clawsSupply[agent] == 0) revert NoMarketExists();
        
        // Must not have already verified
        if (clawsVerified[agent]) revert AlreadyClaimed();
        
        // Mark as verified on claws
        clawsVerified[agent] = true;
        emit AgentClawsVerified(agent);
        
        // Claim reserved claw (free)
        if (!reservedClawClaimed[agent]) {
            reservedClawClaimed[agent] = true;
            clawsBalance[agent][agent] += 1;
            clawsSupply[agent] += 1;
            emit ReservedClawClaimed(agent);
        }
        
        // Claim pending fees
        uint256 pending = pendingFees[agent];
        if (pending > 0) {
            pendingFees[agent] = 0;
            _safeTransfer(agent, pending);
            emit FeesClaimed(agent, pending);
        }
    }

    // ============ Pricing ============

    /**
     * @notice Calculate price for a given supply and amount
     * @dev Uses sum of squares formula: price = supply² / 16000
     *      First claw is free (supply=0 returns 0) - intentional, same as friend.tech
     * @param supply Current supply
     * @param amount Amount to buy/sell
     * @return Total price in wei
     */
    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = supply == 0 && amount == 1
            ? 0
            : (supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }

    /**
     * @notice Get buy price for an agent's claws
     * @param agent The agent address
     * @param amount Number of claws to buy
     * @return Price in wei (before fees)
     */
    function getBuyPrice(address agent, uint256 amount) public view returns (uint256) {
        return getPrice(clawsSupply[agent], amount);
    }

    /**
     * @notice Get sell price for an agent's claws
     * @param agent The agent address
     * @param amount Number of claws to sell
     * @return Price in wei (before fees)
     */
    function getSellPrice(address agent, uint256 amount) public view returns (uint256) {
        if (clawsSupply[agent] < amount) return 0;
        return getPrice(clawsSupply[agent] - amount, amount);
    }

    /**
     * @notice Get buy price including fees
     * @param agent The agent address
     * @param amount Number of claws to buy
     * @return Total price including fees
     */
    function getBuyPriceAfterFee(address agent, uint256 amount) public view returns (uint256) {
        uint256 price = getBuyPrice(agent, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        return price + protocolFee + agentFee;
    }

    /**
     * @notice Get sell price after fees are deducted
     * @param agent The agent address
     * @param amount Number of claws to sell
     * @return Payout after fees
     */
    function getSellPriceAfterFee(address agent, uint256 amount) public view returns (uint256) {
        uint256 price = getSellPrice(agent, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        return price - protocolFee - agentFee;
    }

    // ============ Trading ============

    /**
     * @notice Buy claws of an agent
     * @dev First buy creates the market (agent must be source-verified)
     * @param agent The agent address
     * @param amount Number of claws to buy
     * @param maxCost Maximum total cost willing to pay (slippage protection)
     */
    function buyClaws(address agent, uint256 amount, uint256 maxCost) external payable nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        
        uint256 supply = clawsSupply[agent];

        // First buy creates market - requires source verification and not revoked
        if (supply == 0) {
            if (!sourceVerified[agent]) revert AgentNotSourceVerified();
            if (revoked[agent]) revert AgentIsRevoked();
            emit MarketCreated(agent, msg.sender);
        }

        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        uint256 totalCost = price + protocolFee + agentFee;

        // Slippage check
        if (totalCost > maxCost) revert SlippageExceeded();
        if (msg.value < totalCost) revert InsufficientPayment();

        // Update state before transfers
        clawsBalance[agent][msg.sender] += amount;
        clawsSupply[agent] = supply + amount;

        emit Trade(msg.sender, agent, true, amount, price, protocolFee, agentFee, supply + amount);

        // Transfer protocol fee
        _safeTransfer(protocolFeeDestination, protocolFee);

        // Agent fee: direct if claws-verified and not revoked, otherwise accumulate
        if (clawsVerified[agent] && !revoked[agent]) {
            _safeTransfer(agent, agentFee);
        } else {
            pendingFees[agent] += agentFee;
        }

        // Refund excess
        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            _safeTransfer(msg.sender, excess);
        }
    }

    /**
     * @notice Sell claws of an agent
     * @param agent The agent address
     * @param amount Number of claws to sell
     * @param minProceeds Minimum proceeds expected (slippage protection)
     */
    function sellClaws(address agent, uint256 amount, uint256 minProceeds) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        
        uint256 supply = clawsSupply[agent];

        // Cannot sell the last claw (prevents complete drain)
        if (supply <= amount) revert CannotSellLastClaw();

        uint256 balance = clawsBalance[agent][msg.sender];
        if (balance < amount) revert InsufficientClaws();

        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        uint256 payout = price - protocolFee - agentFee;

        // Slippage check
        if (payout < minProceeds) revert SlippageExceeded();

        // Update state before transfers
        clawsBalance[agent][msg.sender] = balance - amount;
        clawsSupply[agent] = supply - amount;

        emit Trade(msg.sender, agent, false, amount, price, protocolFee, agentFee, supply - amount);

        // Transfer payout
        _safeTransfer(msg.sender, payout);
        
        // Transfer protocol fee
        _safeTransfer(protocolFeeDestination, protocolFee);

        // Agent fee: direct if claws-verified and not revoked, otherwise accumulate
        if (clawsVerified[agent] && !revoked[agent]) {
            _safeTransfer(agent, agentFee);
        } else {
            pendingFees[agent] += agentFee;
        }
    }

    // ============ Views ============

    /**
     * @notice Get claw balance for a holder
     * @param agent The agent address
     * @param holder The holder address
     * @return Number of claws held
     */
    function getClawsBalance(address agent, address holder) external view returns (uint256) {
        return clawsBalance[agent][holder];
    }

    /**
     * @notice Check if market exists for an agent
     * @param agent The agent address
     * @return True if market exists
     */
    function marketExists(address agent) external view returns (bool) {
        return clawsSupply[agent] > 0;
    }

    /**
     * @notice Get agent status
     * @param agent The agent address
     * @return _sourceVerified Is verified on moltbook/X
     * @return _clawsVerified Has verified on claws.tech
     * @return _revoked Has been revoked
     * @return _reservedClawClaimed Has claimed free claw
     * @return _pendingFees Unclaimed accumulated fees
     * @return _supply Total claws supply
     */
    function getAgentStatus(address agent) external view returns (
        bool _sourceVerified,
        bool _clawsVerified,
        bool _revoked,
        bool _reservedClawClaimed,
        uint256 _pendingFees,
        uint256 _supply
    ) {
        return (
            sourceVerified[agent],
            clawsVerified[agent],
            revoked[agent],
            reservedClawClaimed[agent],
            pendingFees[agent],
            clawsSupply[agent]
        );
    }

    // ============ Admin ============

    /**
     * @notice Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Update verifier address
     * @param _verifier The new verifier address
     */
    function setVerifier(address _verifier) external onlyOwner {
        if (_verifier == address(0)) revert ZeroAddress();
        verifier = _verifier;
        emit VerifierUpdated(_verifier);
    }

    /**
     * @notice Update protocol fee destination
     * @param _destination The new destination address
     */
    function setProtocolFeeDestination(address _destination) external onlyOwner {
        if (_destination == address(0)) revert ZeroAddress();
        protocolFeeDestination = _destination;
        emit ProtocolFeeDestinationUpdated(_destination);
    }

    /**
     * @notice Update fee percentages
     * @param _protocolFee Protocol fee (in wei, 5e16 = 5%)
     * @param _agentFee Agent fee (in wei, 5e16 = 5%)
     */
    function setFees(uint256 _protocolFee, uint256 _agentFee) external onlyOwner {
        // Max 20% total fees
        if (_protocolFee + _agentFee > 200000000000000000) revert FeesTooHigh();
        protocolFeePercent = _protocolFee;
        agentFeePercent = _agentFee;
        emit FeesUpdated(_protocolFee, _agentFee);
    }

    /**
     * @notice Pause all trading (emergency stop)
     * @dev Both owner and verifier can pause for faster emergency response
     */
    function pause() external onlyVerifier {
        _pause();
    }

    /**
     * @notice Unpause trading
     * @dev Only owner can unpause (verifier can pause but not unpause)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Internal ============

    /**
     * @notice Safe ETH transfer
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _safeTransfer(address to, uint256 amount) internal {
        (bool success,) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}
