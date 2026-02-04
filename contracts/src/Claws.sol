// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Claws
 * @notice Speculation market for AI agent reputation
 * @dev Based on friend.tech bonding curve mechanics
 */
contract Claws is ReentrancyGuard {
    // ============ State ============

    /// @notice Total claws supply for each agent
    mapping(address => uint256) public clawsSupply;

    /// @notice Claw balance for each holder per agent
    mapping(address => mapping(address => uint256)) public clawsBalance;

    /// @notice Verified agents allowed to have claws
    mapping(address => bool) public verifiedAgents;

    /// @notice Agent's X handle for display
    mapping(address => string) public agentXHandle;

    /// @notice Protocol fee percentage (in wei, 5e16 = 5%)
    uint256 public protocolFeePercent = 50000000000000000;

    /// @notice Agent fee percentage (in wei, 5e16 = 5%)
    uint256 public agentFeePercent = 50000000000000000;

    /// @notice Protocol fee destination
    address public protocolFeeDestination;

    /// @notice Contract owner
    address public owner;

    // ============ Events ============

    event AgentVerified(address indexed agent, string xHandle);
    event AgentUnverified(address indexed agent);
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
    error AgentNotVerified();
    error AgentMustBuyFirst();
    error InsufficientPayment();
    error InsufficientClaws();
    error CannotSellLastClaw();
    error TransferFailed();
    error FeesTooHigh();
    error ZeroAddress();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ============ Constructor ============

    constructor(address _protocolFeeDestination) {
        if (_protocolFeeDestination == address(0)) revert ZeroAddress();
        owner = msg.sender;
        protocolFeeDestination = _protocolFeeDestination;
    }

    // ============ Verification ============

    /**
     * @notice Verify an agent to allow them to have claws
     * @param agent The agent's wallet address
     * @param xHandle The agent's X/Twitter handle
     */
    function verifyAgent(address agent, string calldata xHandle) external onlyOwner {
        if (agent == address(0)) revert ZeroAddress();
        verifiedAgents[agent] = true;
        agentXHandle[agent] = xHandle;
        emit AgentVerified(agent, xHandle);
    }

    /**
     * @notice Remove verification from an agent
     * @param agent The agent's wallet address
     */
    function unverifyAgent(address agent) external onlyOwner {
        verifiedAgents[agent] = false;
        emit AgentUnverified(agent);
    }

    // ============ Pricing ============

    /**
     * @notice Calculate price for a given supply and amount
     * @dev Uses sum of squares formula: price = supply² / 16000
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
     * @param agent The agent address
     * @param amount Number of claws to buy
     */
    function buyClaws(address agent, uint256 amount) external payable nonReentrant {
        if (!verifiedAgents[agent]) revert AgentNotVerified();

        uint256 supply = clawsSupply[agent];

        // First claw must be bought by the agent themselves
        if (supply == 0 && msg.sender != agent) revert AgentMustBuyFirst();

        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        uint256 totalCost = price + protocolFee + agentFee;

        if (msg.value < totalCost) revert InsufficientPayment();

        // Update state before transfers
        clawsBalance[agent][msg.sender] += amount;
        clawsSupply[agent] = supply + amount;

        emit Trade(msg.sender, agent, true, amount, price, protocolFee, agentFee, supply + amount);

        // Transfer fees
        _safeTransfer(protocolFeeDestination, protocolFee);
        _safeTransfer(agent, agentFee);

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
     */
    function sellClaws(address agent, uint256 amount) external nonReentrant {
        uint256 supply = clawsSupply[agent];

        // Cannot sell the last claw (prevents complete drain)
        if (supply <= amount) revert CannotSellLastClaw();

        uint256 balance = clawsBalance[agent][msg.sender];
        if (balance < amount) revert InsufficientClaws();

        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        uint256 payout = price - protocolFee - agentFee;

        // Update state before transfers
        clawsBalance[agent][msg.sender] = balance - amount;
        clawsSupply[agent] = supply - amount;

        emit Trade(msg.sender, agent, false, amount, price, protocolFee, agentFee, supply - amount);

        // Transfer payout and fees
        _safeTransfer(msg.sender, payout);
        _safeTransfer(protocolFeeDestination, protocolFee);
        _safeTransfer(agent, agentFee);
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
     * @notice Check if an agent is verified
     * @param agent The agent address
     * @return True if verified
     */
    function isVerified(address agent) external view returns (bool) {
        return verifiedAgents[agent];
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
