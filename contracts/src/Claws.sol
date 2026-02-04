// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Claws
 * @notice Speculation market for AI agent reputation
 * @dev Bonding curve mechanics integrated with ERC-8004 agent registry
 * 
 * Flow:
 * 1. Agent registers on ERC-8004 (trustless, permissionless)
 * 2. Anyone can create market for any 8004-registered agent
 * 3. Trading happens, fees accumulate for agent
 * 4. Agent calls verifyAndClaim() → claims free reserved claw + accumulated fees
 * 5. Agent earns 5% on all future trades
 *
 * Supply cap: ~2.6e8 claws per agent before overflow (sum of cubes formula)
 * This is practically unreachable but documented for auditors.
 *
 * Liquidity note: First claw is free (price=0 at supply=0). The free reserved claw
 * on verification can create a small liquidity gap at very low supply. This is
 * self-healing (any subsequent buy adds ETH) and matches friend.tech behavior.
 */
contract Claws is ReentrancyGuard, Pausable {
    // ============ Constants ============

    /// @notice ERC-8004 Identity Registry on Base
    IERC721 public immutable erc8004Registry;

    // ============ State ============

    /// @notice Total claws supply for each agent
    mapping(address => uint256) public clawsSupply;

    /// @notice Claw balance for each holder per agent
    mapping(address => mapping(address => uint256)) public clawsBalance;

    /// @notice Agent has verified on claws.tech - enables fee claims
    mapping(address => bool) public clawsVerified;

    /// @notice Agent has been revoked (compromised account, abuse, etc)
    mapping(address => bool) public revoked;

    /// @notice Agent has claimed their reserved free claw
    mapping(address => bool) public reservedClawClaimed;

    /// @notice Accumulated fees before agent verifies on claws.tech
    mapping(address => uint256) public pendingFees;

    /// @notice Total lifetime fees accumulated for agent (never decremented)
    mapping(address => uint256) public lifetimeFees;

    /// @notice Protocol fee percentage (in wei, 5e16 = 5%)
    uint256 public protocolFeePercent = 50000000000000000;

    /// @notice Agent fee percentage (in wei, 5e16 = 5%)
    uint256 public agentFeePercent = 50000000000000000;

    /// @notice Protocol fee destination
    address public protocolFeeDestination;

    /// @notice Contract owner
    address public owner;

    // ============ Events ============

    event AgentClawsVerified(address indexed agent);
    event AgentRevoked(address indexed agent, string reason);
    event AgentUnrevoked(address indexed agent);
    event ReservedClawClaimed(address indexed agent);
    event FeesClaimed(address indexed agent, uint256 amount);
    event MarketCreated(address indexed agent, address indexed creator);
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
    error AgentNotRegistered();
    error AgentIsRevoked();
    error AlreadyClaimed();
    error NoMarketExists();
    error InsufficientPayment();
    error InsufficientClaws();
    error CannotSellLastClaw();
    error TransferFailed();
    error FeesTooHigh();
    error ZeroAddress();
    error SlippageExceeded();
    error ZeroAmount();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ============ Constructor ============

    /**
     * @param _protocolFeeDestination Address to receive protocol fees
     * @param _erc8004Registry ERC-8004 Identity Registry address (0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 on Base)
     */
    constructor(address _protocolFeeDestination, address _erc8004Registry) {
        if (_protocolFeeDestination == address(0)) revert ZeroAddress();
        if (_erc8004Registry == address(0)) revert ZeroAddress();
        owner = msg.sender;
        protocolFeeDestination = _protocolFeeDestination;
        erc8004Registry = IERC721(_erc8004Registry);
    }

    // ============ 8004 Integration ============

    /**
     * @notice Check if an agent is registered in ERC-8004
     * @param agent The agent's wallet address
     * @return True if agent owns at least one 8004 agent NFT
     */
    function isRegisteredAgent(address agent) public view returns (bool) {
        return erc8004Registry.balanceOf(agent) > 0;
    }

    // ============ Revocation (Emergency) ============

    /**
     * @notice Revoke an agent (compromised account, abuse, etc)
     * @dev Prevents new market creation and fee claims. Existing markets can still trade.
     * @param agent The agent's wallet address
     * @param reason Human-readable reason for revocation
     */
    function revokeAgent(address agent, string calldata reason) external onlyOwner {
        revoked[agent] = true;
        emit AgentRevoked(agent, reason);
    }

    /**
     * @notice Un-revoke an agent (false positive, issue resolved, etc)
     * @param agent The agent's wallet address
     */
    function unrevokeAgent(address agent) external onlyOwner {
        revoked[agent] = false;
        emit AgentUnrevoked(agent);
    }

    // ============ Agent Claim ============

    /**
     * @notice Agent claims reserved claw and accumulated fees
     * @dev Agent must call this themselves (proves wallet ownership)
     */
    function verifyAndClaim() external nonReentrant whenNotPaused {
        address agent = msg.sender;
        
        // Must not be revoked
        if (revoked[agent]) revert AgentIsRevoked();
        
        // Must have a market (someone bought claws)
        if (clawsSupply[agent] == 0) revert NoMarketExists();
        
        // Must not have already claimed
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
     * @dev First buy creates the market (agent must be registered in ERC-8004)
     * @param agent The agent address
     * @param amount Number of claws to buy
     * @param maxCost Maximum total cost willing to pay (slippage protection)
     */
    function buyClaws(address agent, uint256 amount, uint256 maxCost) external payable nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        
        uint256 supply = clawsSupply[agent];

        // First buy creates market - requires 8004 registration and not revoked
        if (supply == 0) {
            if (!isRegisteredAgent(agent)) revert AgentNotRegistered();
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
        
        // Track lifetime fees (append-only, never decremented)
        lifetimeFees[agent] += agentFee;

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
        
        // Track lifetime fees (append-only, never decremented)
        lifetimeFees[agent] += agentFee;
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
     * @notice Get contract ETH balance (for frontend liquidity display)
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get agent status
     * @param agent The agent address
     * @return _isRegistered Is registered in ERC-8004
     * @return _clawsVerified Has claimed on claws.tech
     * @return _revoked Has been revoked
     * @return _reservedClawClaimed Has claimed free claw
     * @return _pendingFees Unclaimed accumulated fees
     * @return _supply Total claws supply
     */
    function getAgentStatus(address agent) external view returns (
        bool _isRegistered,
        bool _clawsVerified,
        bool _revoked,
        bool _reservedClawClaimed,
        uint256 _pendingFees,
        uint256 _supply
    ) {
        return (
            isRegisteredAgent(agent),
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
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause trading
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
