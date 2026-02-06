// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title Claws
 * @notice Bonding curve speculation market for AI agents
 * @dev Handle-based markets using bonding curve pricing
 *
 * Formula: price = supply² / 16000 ETH (Claws bonding curve)
 * - 1st claw: FREE for whitelisted handles only (bonus claw on first buy)
 * - Non-whitelisted: no free claw, minimum 2 claws on first buy
 * - 10th claw: 0.00625 ETH (~$19)
 * - 100th claw: 0.625 ETH (~$1,875)
 * - Gets expensive FAST — creates early buyer advantage
 *
 * WHOLE CLAWS ONLY: Minimum 1 claw per trade. No fractional purchases.
 *
 * VERIFIED AGENTS: Earn 5% of all trade fees. No free claws on verification.
 */
contract Claws is ReentrancyGuard, Ownable, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ Constants ============
    
    /// @notice Protocol fee: 5% (500 basis points)
    uint256 public constant PROTOCOL_FEE_BPS = 500;
    
    /// @notice Agent fee: 5% (500 basis points)  
    uint256 public constant AGENT_FEE_BPS = 500;
    
    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    /// @notice Price curve divisor (bonding curve formula)
    /// Formula: price = supply² / PRICE_DIVISOR
    uint256 public constant PRICE_DIVISOR = 16000;
    
    // ============ State ============
    
    /// @notice Market data for each X handle (hashed)
    struct Market {
        uint256 supply;           // Total claws in circulation
        uint256 pendingFees;      // Unclaimed agent fees (ETH)
        uint256 lifetimeFees;     // Total fees earned (ETH)
        uint256 lifetimeVolume;   // Total trade volume (ETH)
        address verifiedWallet;   // Bound wallet (zero until verified)
        bool isVerified;          // Whether agent has verified
        uint256 createdAt;        // Block timestamp of market creation
    }
    
    /// @notice Markets indexed by keccak256(handle)
    mapping(bytes32 => Market) public markets;
    
    /// @notice Claw balances: handleHash => holder => balance
    mapping(bytes32 => mapping(address => uint256)) public clawsBalance;
    
    /// @notice Handle string storage (for frontend)
    mapping(bytes32 => string) public handleStrings;
    
    /// @notice Trusted verifier address (signs verification proofs)
    address public verifier;
    
    /// @notice Protocol treasury
    address public treasury;
    
    /// @notice Used nonces for verification (prevent replay)
    mapping(bytes32 => bool) public usedNonces;
    
    /// @notice Whitelisted handles that get free first claw (tier system)
    mapping(bytes32 => bool) public whitelisted;
    
    // ============ Events ============
    
    event MarketCreated(bytes32 indexed handleHash, string handle, address creator);
    event Trade(
        bytes32 indexed handleHash,
        address indexed trader,
        bool isBuy,
        uint256 amount,
        uint256 price,
        uint256 protocolFee,
        uint256 agentFee,
        uint256 newSupply
    );
    event AgentVerified(bytes32 indexed handleHash, string handle, address wallet);
    event FeesClaimed(bytes32 indexed handleHash, address wallet, uint256 amount);
    event VerifierUpdated(address oldVerifier, address newVerifier);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event AgentWalletUpdated(bytes32 indexed handleHash, string handle, address oldWallet, address newWallet);
    event VerificationRevoked(bytes32 indexed handleHash, string handle);
    event WhitelistUpdated(bytes32 indexed handleHash, string handle, bool status);
    
    // ============ Errors ============
    
    error MarketAlreadyExists();
    error MarketDoesNotExist();
    error InvalidAmount();
    error InsufficientBalance();
    error InsufficientPayment();
    error SlippageExceeded();
    error AlreadyVerified();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error NotVerified();
    error NoFeesPending();
    error TransferFailed();
    error InvalidHandle();
    error ZeroAddress();
    error CannotSellLastClaw();
    error MarketNotVerified();
    error AlreadyRevoked();
    error SignatureExpired();
    
    // ============ Constructor ============
    
    constructor(
        address _verifier,
        address _treasury
    ) Ownable(msg.sender) {
        if (_verifier == address(0) || _treasury == address(0)) {
            revert ZeroAddress();
        }
        verifier = _verifier;
        treasury = _treasury;
    }
    
    // ============ Market Creation ============
    
    /**
     * @notice Create a market for an X handle (permissionless)
     * @param handle The X handle (without @)
     */
    function createMarket(string calldata handle) external {
        if (bytes(handle).length == 0 || bytes(handle).length > 32) {
            revert InvalidHandle();
        }
        
        bytes32 handleHash = _hashHandle(handle);
        
        if (markets[handleHash].createdAt != 0) {
            revert MarketAlreadyExists();
        }
        
        markets[handleHash] = Market({
            supply: 0,
            pendingFees: 0,
            lifetimeFees: 0,
            lifetimeVolume: 0,
            verifiedWallet: address(0),
            isVerified: false,
            createdAt: block.timestamp
        });
        
        handleStrings[handleHash] = handle;
        
        emit MarketCreated(handleHash, handle, msg.sender);
    }
    
    // ============ Trading ============
    
    /**
     * @notice Buy claws for a handle
     * @param handle The X handle
     * @param amount Number of whole claws to buy (minimum 1, no fractions)
     * @dev Whitelisted handles get 1 bonus claw on first buy (supply == 0)
     * @dev Non-whitelisted handles must buy >= 2 claws on first buy
     */
    function buyClaws(string calldata handle, uint256 amount) external payable nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();

        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];

        // Auto-create market if doesn't exist
        if (market.createdAt == 0) {
            if (bytes(handle).length == 0 || bytes(handle).length > 32) {
                revert InvalidHandle();
            }
            market.createdAt = block.timestamp;
            handleStrings[handleHash] = handle;
            emit MarketCreated(handleHash, handle, msg.sender);
        }

        // Check whitelist status for first buy
        bool isWhitelist = whitelisted[handleHash];
        uint256 mintAmount = amount;

        if (market.supply == 0) {
            if (isWhitelist) {
                // Whitelisted: bonus claw on first buy
                mintAmount = amount + 1;
            } else {
                // Non-whitelisted: must buy at least 2 claws
                if (amount < 2) revert InvalidAmount();
            }
        }

        uint256 price = getBuyPrice(handleHash, amount);
        uint256 protocolFee = (price * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 agentFee = (price * AGENT_FEE_BPS) / BPS_DENOMINATOR;
        uint256 totalCost = price + protocolFee + agentFee;

        if (msg.value < totalCost) revert InsufficientPayment();

        // Send protocol fee to treasury
        (bool sent,) = treasury.call{value: protocolFee}("");
        if (!sent) revert TransferFailed();

        // Accumulate agent fee (claimable after verification)
        market.pendingFees += agentFee;
        market.lifetimeFees += agentFee;
        market.lifetimeVolume += price;

        // Update balances (use mintAmount for actual claw issuance)
        market.supply += mintAmount;
        clawsBalance[handleHash][msg.sender] += mintAmount;

        // Refund excess ETH
        if (msg.value > totalCost) {
            (bool refunded,) = msg.sender.call{value: msg.value - totalCost}("");
            if (!refunded) revert TransferFailed();
        }

        emit Trade(handleHash, msg.sender, true, mintAmount, price, protocolFee, agentFee, market.supply);
    }
    
    /**
     * @notice Sell claws for a handle
     * @param handle The X handle
     * @param amount Number of whole claws to sell (minimum 1, no fractions)
     * @param minProceeds Minimum ETH to receive (slippage protection)
     */
    function sellClaws(
        string calldata handle,
        uint256 amount,
        uint256 minProceeds
    ) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        
        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];
        
        if (market.createdAt == 0) revert MarketDoesNotExist();
        if (clawsBalance[handleHash][msg.sender] < amount) revert InsufficientBalance();
        
        // Cannot sell if it would leave supply at 0 (market integrity)
        if (market.supply == amount) revert CannotSellLastClaw();
        
        uint256 price = getSellPrice(handleHash, amount);
        uint256 protocolFee = (price * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 agentFee = (price * AGENT_FEE_BPS) / BPS_DENOMINATOR;
        uint256 proceeds = price - protocolFee - agentFee;
        
        if (proceeds < minProceeds) revert SlippageExceeded();
        
        // Update balances first (CEI pattern)
        market.supply -= amount;
        clawsBalance[handleHash][msg.sender] -= amount;
        
        // Accumulate fees
        market.pendingFees += agentFee;
        market.lifetimeFees += agentFee;
        market.lifetimeVolume += price;
        
        // Transfer fees and proceeds
        (bool feeSent, ) = treasury.call{value: protocolFee}("");
        if (!feeSent) revert TransferFailed();
        
        (bool proceedsSent, ) = msg.sender.call{value: proceeds}("");
        if (!proceedsSent) revert TransferFailed();
        
        emit Trade(
            handleHash,
            msg.sender,
            false,
            amount,
            price,
            protocolFee,
            agentFee,
            market.supply
        );
    }
    
    // ============ Verification ============
    
    /**
     * @notice Verify ownership and bind wallet to handle
     * @param handle The X handle being verified
     * @param wallet The wallet to bind
     * @param timestamp Signature timestamp
     * @param nonce Unique nonce to prevent replay
     * @param signature Verifier's signature
     */
    function verifyAndClaim(
        string calldata handle,
        address wallet,
        uint256 timestamp,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];
        
        if (market.createdAt == 0) revert MarketDoesNotExist();
        if (market.isVerified) revert AlreadyVerified();
        
        // Signature must be less than 1 hour old
        if (block.timestamp > timestamp + 3600) revert SignatureExpired();
        
        // Verify signature from trusted verifier
        bytes32 nonceHash = keccak256(abi.encodePacked(handle, wallet, timestamp, nonce));
        if (usedNonces[nonceHash]) revert NonceAlreadyUsed();
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(handle, wallet, timestamp, nonce)
        );
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        
        if (ethSignedHash.recover(signature) != verifier) {
            revert InvalidSignature();
        }
        
        // Mark nonce as used
        usedNonces[nonceHash] = true;
        
        // Bind wallet and mark verified
        market.verifiedWallet = wallet;
        market.isVerified = true;
        
        emit AgentVerified(handleHash, handle, wallet);
        
        // Auto-claim any pending fees
        if (market.pendingFees > 0) {
            uint256 fees = market.pendingFees;
            market.pendingFees = 0;
            (bool sent, ) = wallet.call{value: fees}("");
            if (!sent) revert TransferFailed();
            emit FeesClaimed(handleHash, wallet, fees);
        }
    }
    
    /**
     * @notice Claim accumulated fees (verified agents only)
     * @param handle The X handle
     */
    function claimFees(string calldata handle) external nonReentrant {
        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];
        
        if (!market.isVerified) revert NotVerified();
        if (msg.sender != market.verifiedWallet) revert NotVerified();
        if (market.pendingFees == 0) revert NoFeesPending();
        
        uint256 fees = market.pendingFees;
        market.pendingFees = 0;
        
        (bool sent, ) = msg.sender.call{value: fees}("");
        if (!sent) revert TransferFailed();
        
        emit FeesClaimed(handleHash, msg.sender, fees);
    }
    
    // ============ Price Calculations ============
    
    /**
     * @notice Get the price to buy `amount` claws
     * @param handleHash The handle hash
     * @param amount Number of claws
     * @return Total price in ETH (wei)
     */
    function getBuyPrice(bytes32 handleHash, uint256 amount) public view returns (uint256) {
        uint256 supply = markets[handleHash].supply;
        return _getPrice(supply, amount);
    }
    
    /**
     * @notice Get the price to buy `amount` claws (by handle string)
     */
    function getBuyPriceByHandle(string calldata handle, uint256 amount) external view returns (uint256) {
        return getBuyPrice(_hashHandle(handle), amount);
    }
    
    /**
     * @notice Get the proceeds from selling `amount` claws
     * @param handleHash The handle hash
     * @param amount Number of claws
     * @return Total proceeds in ETH (wei)
     */
    function getSellPrice(bytes32 handleHash, uint256 amount) public view returns (uint256) {
        uint256 supply = markets[handleHash].supply;
        if (amount > supply) revert InsufficientBalance();
        return _getPrice(supply - amount, amount);
    }
    
    /**
     * @notice Get the proceeds from selling `amount` claws (by handle string)
     */
    function getSellPriceByHandle(string calldata handle, uint256 amount) external view returns (uint256) {
        return getSellPrice(_hashHandle(handle), amount);
    }
    
    /**
     * @notice Calculate price using bonding curve (pure bonding curve math)
     * @dev Price = sum of squares from supply to supply+amount-1
     *      Sum of squares bonding curve: sum(n²) from supply to supply+amount-1
     *      No free claws - pure math only
     */
    function _getPrice(uint256 supply, uint256 amount) internal pure returns (uint256) {
        // bonding curve formula: sum squares from supply to (supply + amount - 1)
        // Using sum of squares: n(n+1)(2n+1)/6 for 1 to n

        // sum1 = sum of squares from 1 to (supply - 1), or 0 if supply is 0
        uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;

        // sum2 = sum of squares from 1 to (supply + amount - 1)
        uint256 sum2 =
            (supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1) / 6;

        uint256 summation = sum2 - sum1;

        // Convert to ETH
        return (summation * 1 ether) / PRICE_DIVISOR;
    }
    
    /**
     * @notice Get current price for 1 claw (next buy price)
     * @dev Price = supply² / PRICE_DIVISOR
     *      No special first claw pricing - bonding curve math only
     */
    function getCurrentPrice(string calldata handle) external view returns (uint256) {
        bytes32 handleHash = _hashHandle(handle);
        uint256 supply = markets[handleHash].supply;
        // Price of the next claw = supply² / PRICE_DIVISOR
        return (supply * supply * 1 ether) / PRICE_DIVISOR;
    }
    
    /**
     * @notice Get cost breakdown for buying
     */
    function getBuyCostBreakdown(
        string calldata handle,
        uint256 amount
    ) external view returns (
        uint256 price,
        uint256 protocolFee,
        uint256 agentFee,
        uint256 totalCost
    ) {
        bytes32 handleHash = _hashHandle(handle);
        price = getBuyPrice(handleHash, amount);
        protocolFee = (price * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        agentFee = (price * AGENT_FEE_BPS) / BPS_DENOMINATOR;
        totalCost = price + protocolFee + agentFee;
    }
    
    /**
     * @notice Get proceeds breakdown for selling
     */
    function getSellProceedsBreakdown(
        string calldata handle,
        uint256 amount
    ) external view returns (
        uint256 price,
        uint256 protocolFee,
        uint256 agentFee,
        uint256 proceeds
    ) {
        bytes32 handleHash = _hashHandle(handle);
        price = getSellPrice(handleHash, amount);
        protocolFee = (price * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        agentFee = (price * AGENT_FEE_BPS) / BPS_DENOMINATOR;
        proceeds = price - protocolFee - agentFee;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get market data for a handle
     */
    function getMarket(string calldata handle) external view returns (
        uint256 supply,
        uint256 pendingFees,
        uint256 lifetimeFees,
        uint256 lifetimeVolume,
        address verifiedWallet,
        bool isVerified,
        uint256 createdAt,
        uint256 currentPrice
    ) {
        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];
        
        supply = market.supply;
        pendingFees = market.pendingFees;
        lifetimeFees = market.lifetimeFees;
        lifetimeVolume = market.lifetimeVolume;
        verifiedWallet = market.verifiedWallet;
        isVerified = market.isVerified;
        createdAt = market.createdAt;
        
        // Current price to buy 1 claw
        currentPrice = (supply * supply * 1 ether) / PRICE_DIVISOR;
    }
    
    /**
     * @notice Get user's claw balance for a handle
     */
    function getBalance(string calldata handle, address user) external view returns (uint256) {
        return clawsBalance[_hashHandle(handle)][user];
    }
    
    /**
     * @notice Check if a market exists
     */
    function marketExists(string calldata handle) external view returns (bool) {
        return markets[_hashHandle(handle)].createdAt != 0;
    }
    
    // ============ Admin Functions ============
    
    function setVerifier(address _verifier) external onlyOwner {
        if (_verifier == address(0)) revert ZeroAddress();
        emit VerifierUpdated(verifier, _verifier);
        verifier = _verifier;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }
    
    /// @notice Emergency pause - stops all trading
    function pause() external onlyOwner {
        _pause();
    }
    
    /// @notice Resume trading after pause
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Update the verified wallet for a market (owner only)
     * @param handle The X handle
     * @param newWallet The new wallet address to set
     */
    function updateAgentWallet(string calldata handle, address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();

        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];

        if (market.createdAt == 0) revert MarketDoesNotExist();
        if (!market.isVerified) revert MarketNotVerified();

        address oldWallet = market.verifiedWallet;
        market.verifiedWallet = newWallet;

        emit AgentWalletUpdated(handleHash, handle, oldWallet, newWallet);
    }

    /**
     * @notice Revoke verification for a market (owner only)
     * @dev Sets isVerified to false and verifiedWallet to address(0)
     * @dev Pending fees remain frozen until re-verification
     * @param handle The X handle
     */
    function revokeVerification(string calldata handle) external onlyOwner {
        bytes32 handleHash = _hashHandle(handle);
        Market storage market = markets[handleHash];

        if (market.createdAt == 0) revert MarketDoesNotExist();
        if (!market.isVerified) revert MarketNotVerified();

        market.isVerified = false;
        market.verifiedWallet = address(0);

        emit VerificationRevoked(handleHash, handle);
    }

    // ============ Whitelist Functions ============

    /**
     * @notice Set whitelist status for a single handle (owner only)
     * @param handle The X handle to whitelist
     * @param status True to whitelist, false to remove
     * @dev Whitelisted handles get 1 bonus claw on first buy
     */
    function setWhitelisted(string calldata handle, bool status) external onlyOwner {
        bytes32 handleHash = _hashHandle(handle);
        whitelisted[handleHash] = status;
        emit WhitelistUpdated(handleHash, handle, status);
    }

    /**
     * @notice Batch set whitelist status for multiple handles (owner only)
     * @param handles Array of X handles to whitelist
     * @param status True to whitelist, false to remove
     */
    function setWhitelistedBatch(string[] calldata handles, bool status) external onlyOwner {
        for (uint256 i = 0; i < handles.length; i++) {
            bytes32 handleHash = _hashHandle(handles[i]);
            whitelisted[handleHash] = status;
            emit WhitelistUpdated(handleHash, handles[i], status);
        }
    }

    /**
     * @notice Check if a handle is whitelisted
     * @param handle The X handle to check
     * @return True if whitelisted
     */
    function isWhitelisted(string calldata handle) external view returns (bool) {
        return whitelisted[_hashHandle(handle)];
    }

    // ============ Internal ============
    
    function _hashHandle(string memory handle) internal pure returns (bytes32) {
        // Normalize to lowercase for consistent hashing
        bytes memory handleBytes = bytes(handle);
        for (uint256 i = 0; i < handleBytes.length; i++) {
            if (handleBytes[i] >= 0x41 && handleBytes[i] <= 0x5A) {
                handleBytes[i] = bytes1(uint8(handleBytes[i]) + 32);
            }
        }
        return keccak256(handleBytes);
    }
    
    // ============ Receive ============
    
    receive() external payable {}
}
