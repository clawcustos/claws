// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Claws} from "../src/Claws.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Mock ERC-8004 Registry
contract MockERC8004 is IERC721 {
    mapping(address => uint256) private _balances;
    
    function setBalance(address account, uint256 balance) external {
        _balances[account] = balance;
    }
    
    function balanceOf(address owner) external view override returns (uint256) {
        return _balances[owner];
    }
    
    // Unused but required by interface
    function ownerOf(uint256) external pure override returns (address) { return address(0); }
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure override {}
    function safeTransferFrom(address, address, uint256) external pure override {}
    function transferFrom(address, address, uint256) external pure override {}
    function approve(address, uint256) external pure override {}
    function setApprovalForAll(address, bool) external pure override {}
    function getApproved(uint256) external pure override returns (address) { return address(0); }
    function isApprovedForAll(address, address) external pure override returns (bool) { return false; }
    function supportsInterface(bytes4) external pure override returns (bool) { return true; }
}

contract ClawsTest is Test {
    Claws public claws;
    MockERC8004 public registry;
    
    address public owner = address(1);
    address public treasury = address(3);
    address public agent1 = address(4);
    address public agent2 = address(5);
    address public trader1 = address(6);
    address public trader2 = address(7);
    
    function setUp() public {
        // Deploy mock registry
        registry = new MockERC8004();
        
        // Deploy Claws with registry
        vm.prank(owner);
        claws = new Claws(treasury, address(registry));
        
        // Fund accounts
        vm.deal(agent1, 10 ether);
        vm.deal(agent2, 10 ether);
        vm.deal(trader1, 10 ether);
        vm.deal(trader2, 10 ether);
    }
    
    // ============ Deployment ============
    
    function test_Deployment() public view {
        assertEq(claws.owner(), owner);
        assertEq(claws.protocolFeeDestination(), treasury);
        assertEq(claws.protocolFeePercent(), 50000000000000000); // 5%
        assertEq(claws.agentFeePercent(), 50000000000000000); // 5%
        assertEq(address(claws.erc8004Registry()), address(registry));
    }
    
    // ============ 8004 Registration ============
    
    function test_IsRegisteredAgent() public {
        assertFalse(claws.isRegisteredAgent(agent1));
        
        registry.setBalance(agent1, 1);
        assertTrue(claws.isRegisteredAgent(agent1));
    }
    
    // ============ Revocation ============
    
    function test_RevokeAgent() public {
        registry.setBalance(agent1, 1);
        
        vm.prank(owner);
        claws.revokeAgent(agent1, "compromised account");
        
        assertTrue(claws.revoked(agent1));
    }
    
    function test_RevokeAgent_BlocksMarketCreation() public {
        registry.setBalance(agent1, 1);
        
        vm.prank(owner);
        claws.revokeAgent(agent1, "compromised");
        
        uint256 maxCost = 1 ether;
        vm.prank(trader1);
        vm.expectRevert(Claws.AgentIsRevoked.selector);
        claws.buyClaws{value: maxCost}(agent1, 1, maxCost);
    }
    
    function test_RevokeAgent_BlocksVerifyAndClaim() public {
        _setupMarket(agent1);
        
        vm.prank(owner);
        claws.revokeAgent(agent1, "compromised");
        
        vm.prank(agent1);
        vm.expectRevert(Claws.AgentIsRevoked.selector);
        claws.verifyAndClaim();
    }
    
    function test_RevokeAgent_ExistingMarketsCanStillTrade() public {
        _setupMarket(agent1);
        
        vm.prank(owner);
        claws.revokeAgent(agent1, "compromised");
        
        // Can still buy (market already exists)
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 1, price);
        
        assertEq(claws.clawsBalance(agent1, trader2), 1);
    }
    
    function test_UnrevokeAgent() public {
        registry.setBalance(agent1, 1);
        
        vm.prank(owner);
        claws.revokeAgent(agent1, "suspected compromise");
        assertTrue(claws.revoked(agent1));
        
        vm.prank(owner);
        claws.unrevokeAgent(agent1);
        assertFalse(claws.revoked(agent1));
        
        // Can now create market again
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        vm.prank(trader1);
        claws.buyClaws{value: price}(agent1, 1, price);
        
        assertEq(claws.clawsSupply(agent1), 1);
    }
    
    function test_RevokedAgent_CanStillSell() public {
        _setupMarket(agent1);
        
        // Buy more claws to build up contract balance
        uint256 buyPrice = claws.getBuyPriceAfterFee(agent1, 10);
        vm.prank(trader1);
        claws.buyClaws{value: buyPrice}(agent1, 10, buyPrice);
        
        // Agent verifies and claims their reserved claw
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        // Now agent gets revoked
        vm.prank(owner);
        claws.revokeAgent(agent1, "compromised");
        
        // Agent should still be able to sell their claw to exit
        uint256 agentBalance = claws.clawsBalance(agent1, agent1);
        assertEq(agentBalance, 1);
        
        uint256 minProceeds = claws.getSellPriceAfterFee(agent1, 1);
        vm.prank(agent1);
        claws.sellClaws(agent1, 1, minProceeds);
        
        assertEq(claws.clawsBalance(agent1, agent1), 0);
    }
    
    // ============ Market Creation ============
    
    function test_CreateMarket() public {
        // Register agent in 8004
        registry.setBalance(agent1, 1);
        
        // Trader creates market by buying first claw
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        
        vm.prank(trader1);
        claws.buyClaws{value: price}(agent1, 1, price);
        
        assertEq(claws.clawsSupply(agent1), 1);
        assertEq(claws.clawsBalance(agent1, trader1), 1);
        assertTrue(claws.marketExists(agent1));
    }
    
    function test_CreateMarket_RevertNotRegistered() public {
        // agent1 not registered in 8004
        uint256 maxCost = 0.001 ether;
        
        vm.prank(trader1);
        vm.expectRevert(Claws.AgentNotRegistered.selector);
        claws.buyClaws{value: maxCost}(agent1, 1, maxCost);
    }
    
    // ============ Trading ============
    
    function test_BuyClaws() public {
        _setupMarket(agent1);
        
        uint256 price = claws.getBuyPriceAfterFee(agent1, 2);
        
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 2, price);
        
        assertEq(claws.clawsBalance(agent1, trader2), 2);
        assertEq(claws.clawsSupply(agent1), 3); // 1 initial + 2 new
    }
    
    function test_BuyClaws_AccumulatesFees() public {
        _setupMarket(agent1);
        
        uint256 supplyBefore = claws.clawsSupply(agent1);
        uint256 price = claws.getPrice(supplyBefore, 1);
        uint256 agentFee = price * claws.agentFeePercent() / 1 ether;
        
        uint256 totalCost = claws.getBuyPriceAfterFee(agent1, 1);
        
        vm.prank(trader2);
        claws.buyClaws{value: totalCost}(agent1, 1, totalCost);
        
        // Fees should accumulate since agent not claws-verified
        assertEq(claws.pendingFees(agent1), agentFee);
    }
    
    function test_BuyClaws_RevertZeroAmount() public {
        _setupMarket(agent1);
        
        vm.prank(trader2);
        vm.expectRevert(Claws.ZeroAmount.selector);
        claws.buyClaws{value: 1 ether}(agent1, 0, 1 ether);
    }
    
    function test_BuyClaws_RevertSlippageExceeded() public {
        _setupMarket(agent1);
        
        uint256 actualPrice = claws.getBuyPriceAfterFee(agent1, 1);
        uint256 lowMaxCost = actualPrice - 1; // 1 wei too low
        
        vm.prank(trader2);
        vm.expectRevert(Claws.SlippageExceeded.selector);
        claws.buyClaws{value: actualPrice}(agent1, 1, lowMaxCost);
    }
    
    function test_SellClaws() public {
        _setupMarket(agent1);
        
        // Buy more claws first
        uint256 buyPrice = claws.getBuyPriceAfterFee(agent1, 2);
        vm.prank(trader1);
        claws.buyClaws{value: buyPrice}(agent1, 2, buyPrice);
        
        // Now trader1 has 3 claws, sell 1
        uint256 balanceBefore = trader1.balance;
        uint256 minProceeds = claws.getSellPriceAfterFee(agent1, 1);
        
        vm.prank(trader1);
        claws.sellClaws(agent1, 1, minProceeds);
        
        assertEq(claws.clawsBalance(agent1, trader1), 2);
        assertGt(trader1.balance, balanceBefore);
    }
    
    function test_SellClaws_RevertCannotSellLastClaw() public {
        _setupMarket(agent1);
        
        vm.prank(trader1);
        vm.expectRevert(Claws.CannotSellLastClaw.selector);
        claws.sellClaws(agent1, 1, 0);
    }
    
    function test_SellClaws_RevertInsufficientClaws() public {
        _setupMarket(agent1);
        
        // trader1 has 1, buy more with trader1 to increase supply
        uint256 price1 = claws.getBuyPriceAfterFee(agent1, 4);
        vm.prank(trader1);
        claws.buyClaws{value: price1}(agent1, 4, price1);
        
        // trader2 buys 1
        uint256 price2 = claws.getBuyPriceAfterFee(agent1, 1);
        vm.prank(trader2);
        claws.buyClaws{value: price2}(agent1, 1, price2);
        
        // trader2 tries to sell 2 (more than they have)
        vm.prank(trader2);
        vm.expectRevert(Claws.InsufficientClaws.selector);
        claws.sellClaws(agent1, 2, 0);
    }
    
    function test_SellClaws_RevertZeroAmount() public {
        _setupMarket(agent1);
        
        vm.prank(trader1);
        vm.expectRevert(Claws.ZeroAmount.selector);
        claws.sellClaws(agent1, 0, 0);
    }
    
    function test_SellClaws_RevertSlippageExceeded() public {
        _setupMarket(agent1);
        
        // Buy more claws first
        uint256 buyPrice = claws.getBuyPriceAfterFee(agent1, 2);
        vm.prank(trader1);
        claws.buyClaws{value: buyPrice}(agent1, 2, buyPrice);
        
        // Try to sell with unrealistic minProceeds
        uint256 actualProceeds = claws.getSellPriceAfterFee(agent1, 1);
        uint256 highMinProceeds = actualProceeds + 1 ether;
        
        vm.prank(trader1);
        vm.expectRevert(Claws.SlippageExceeded.selector);
        claws.sellClaws(agent1, 1, highMinProceeds);
    }
    
    // ============ Agent Claim ============
    
    function test_VerifyAndClaim() public {
        _setupMarket(agent1);
        
        // Generate some fees
        uint256 price = claws.getBuyPriceAfterFee(agent1, 2);
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 2, price);
        
        uint256 pendingBefore = claws.pendingFees(agent1);
        assertGt(pendingBefore, 0);
        
        uint256 supplyBefore = claws.clawsSupply(agent1);
        uint256 agentBalanceBefore = agent1.balance;
        
        // Agent verifies and claims
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        // Check verification status
        assertTrue(claws.clawsVerified(agent1));
        assertTrue(claws.reservedClawClaimed(agent1));
        
        // Check reserved claw was given
        assertEq(claws.clawsSupply(agent1), supplyBefore + 1);
        assertEq(claws.clawsBalance(agent1, agent1), 1);
        
        // Check fees were paid
        assertEq(claws.pendingFees(agent1), 0);
        assertEq(agent1.balance, agentBalanceBefore + pendingBefore);
    }
    
    function test_VerifyAndClaim_RevertNoMarket() public {
        vm.prank(agent1);
        vm.expectRevert(Claws.NoMarketExists.selector);
        claws.verifyAndClaim();
    }
    
    function test_VerifyAndClaim_RevertAlreadyClaimed() public {
        _setupMarket(agent1);
        
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        vm.prank(agent1);
        vm.expectRevert(Claws.AlreadyClaimed.selector);
        claws.verifyAndClaim();
    }
    
    function test_DirectFeesAfterVerification() public {
        _setupMarket(agent1);
        
        // Agent verifies
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        uint256 agentBalanceBefore = agent1.balance;
        
        // New trade should send fees directly
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        uint256 basePrice = claws.getBuyPrice(agent1, 1);
        uint256 expectedAgentFee = basePrice * claws.agentFeePercent() / 1 ether;
        
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 1, price);
        
        // Fees should go directly to agent
        assertEq(claws.pendingFees(agent1), 0);
        assertEq(agent1.balance, agentBalanceBefore + expectedAgentFee);
    }
    
    function test_RevokedAgent_FeesAccumulate() public {
        _setupMarket(agent1);
        
        // Agent verifies
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        // Then gets revoked
        vm.prank(owner);
        claws.revokeAgent(agent1, "compromised");
        
        uint256 agentBalanceBefore = agent1.balance;
        
        // Trade should accumulate fees (not send to revoked agent)
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 1, price);
        
        // Fees should accumulate, not go to agent
        assertGt(claws.pendingFees(agent1), 0);
        assertEq(agent1.balance, agentBalanceBefore);
    }
    
    // ============ Pricing ============
    
    function test_BondingCurvePricing() public view {
        // Price for first claw should be 0 (0²/16000)
        uint256 price0 = claws.getPrice(0, 1);
        assertEq(price0, 0);
        
        // Price increases with supply
        uint256 price1 = claws.getPrice(1, 1);
        uint256 price2 = claws.getPrice(2, 1);
        assertGt(price2, price1);
    }
    
    function test_GetBuyPriceAfterFee() public {
        _setupMarket(agent1);
        
        uint256 basePrice = claws.getBuyPrice(agent1, 1);
        uint256 priceWithFee = claws.getBuyPriceAfterFee(agent1, 1);
        
        // 10% total fees
        assertEq(priceWithFee, basePrice + (basePrice * 10 / 100));
    }
    
    // ============ Views ============
    
    function test_GetAgentStatus() public {
        _setupMarket(agent1);
        
        (
            bool isReg,
            bool clawsV,
            bool revokedStatus,
            bool claimed,
            uint256 pending,
            uint256 supply
        ) = claws.getAgentStatus(agent1);
        
        assertTrue(isReg);
        assertFalse(clawsV);
        assertFalse(revokedStatus);
        assertFalse(claimed);
        assertEq(pending, 0); // No fees yet from first buy (price is 0)
        assertEq(supply, 1);
    }
    
    // ============ Pausable ============
    
    function test_Pause_ByOwner() public {
        _setupMarket(agent1);
        
        vm.prank(owner);
        claws.pause();
        
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        
        vm.prank(trader2);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        claws.buyClaws{value: price}(agent1, 1, price);
    }
    
    function test_Unpause() public {
        _setupMarket(agent1);
        
        vm.prank(owner);
        claws.pause();
        
        vm.prank(owner);
        claws.unpause();
        
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 1, price);
        
        assertEq(claws.clawsBalance(agent1, trader2), 1);
    }
    
    function test_Pause_RevertNotOwner() public {
        vm.prank(trader1);
        vm.expectRevert(Claws.NotOwner.selector);
        claws.pause();
    }
    
    // ============ Admin ============
    
    function test_TransferOwnership() public {
        address newOwner = address(99);
        
        vm.prank(owner);
        claws.transferOwnership(newOwner);
        
        assertEq(claws.owner(), newOwner);
    }
    
    function test_SetProtocolFeeDestination() public {
        address newDest = address(99);
        
        vm.prank(owner);
        claws.setProtocolFeeDestination(newDest);
        
        assertEq(claws.protocolFeeDestination(), newDest);
    }
    
    function test_SetFees() public {
        vm.prank(owner);
        claws.setFees(30000000000000000, 70000000000000000); // 3% + 7%
        
        assertEq(claws.protocolFeePercent(), 30000000000000000);
        assertEq(claws.agentFeePercent(), 70000000000000000);
    }
    
    function test_SetFees_RevertFeesTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(Claws.FeesTooHigh.selector);
        claws.setFees(150000000000000000, 100000000000000000); // 15% + 10% = 25% > 20%
    }
    
    // ============ Edge Cases ============
    
    function test_RefundExcessPayment() public {
        _setupMarket(agent1);
        
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        uint256 excess = 1 ether;
        uint256 balanceBefore = trader2.balance;
        
        vm.prank(trader2);
        claws.buyClaws{value: price + excess}(agent1, 1, price + excess);
        
        // Should have been refunded the excess
        assertEq(trader2.balance, balanceBefore - price);
    }
    
    function test_MultipleTrades() public {
        _setupMarket(agent1);
        
        // Multiple buys
        for (uint i = 0; i < 5; i++) {
            uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
            vm.prank(trader2);
            claws.buyClaws{value: price}(agent1, 1, price);
        }
        
        assertEq(claws.clawsBalance(agent1, trader2), 5);
        assertEq(claws.clawsSupply(agent1), 6); // 1 initial + 5 new
        
        // Verify fees accumulated
        assertGt(claws.pendingFees(agent1), 0);
    }
    
    // ============ Lifetime Fees ============
    
    function test_LifetimeFees_IncrementOnBuy() public {
        _setupMarket(agent1);
        
        uint256 lifetimeBefore = claws.lifetimeFees(agent1);
        
        uint256 price = claws.getBuyPriceAfterFee(agent1, 2);
        uint256 basePrice = claws.getBuyPrice(agent1, 2);
        uint256 expectedAgentFee = basePrice * claws.agentFeePercent() / 1 ether;
        
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 2, price);
        
        assertEq(claws.lifetimeFees(agent1), lifetimeBefore + expectedAgentFee);
    }
    
    function test_LifetimeFees_IncrementOnSell() public {
        _setupMarket(agent1);
        
        // Buy some claws first
        uint256 buyPrice = claws.getBuyPriceAfterFee(agent1, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyPrice}(agent1, 5, buyPrice);
        
        uint256 lifetimeBefore = claws.lifetimeFees(agent1);
        
        // Now sell
        uint256 sellPrice = claws.getSellPrice(agent1, 2);
        uint256 expectedAgentFee = sellPrice * claws.agentFeePercent() / 1 ether;
        uint256 minProceeds = claws.getSellPriceAfterFee(agent1, 2);
        
        vm.prank(trader1);
        claws.sellClaws(agent1, 2, minProceeds);
        
        assertEq(claws.lifetimeFees(agent1), lifetimeBefore + expectedAgentFee);
    }
    
    function test_LifetimeFees_PersistAfterVerifyAndClaim() public {
        _setupMarket(agent1);
        
        // Generate fees
        uint256 price = claws.getBuyPriceAfterFee(agent1, 3);
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 3, price);
        
        uint256 lifetimeBefore = claws.lifetimeFees(agent1);
        uint256 pendingBefore = claws.pendingFees(agent1);
        
        assertGt(lifetimeBefore, 0);
        assertGt(pendingBefore, 0);
        
        // Agent verifies and claims
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        // Lifetime fees unchanged, pending fees reset
        assertEq(claws.lifetimeFees(agent1), lifetimeBefore);
        assertEq(claws.pendingFees(agent1), 0);
    }
    
    function test_LifetimeFees_AccumulateAcrossMultipleTrades() public {
        _setupMarket(agent1);
        
        uint256 totalExpectedFees = 0;
        
        // Multiple buys
        for (uint i = 0; i < 3; i++) {
            uint256 basePrice = claws.getBuyPrice(agent1, 1);
            uint256 expectedFee = basePrice * claws.agentFeePercent() / 1 ether;
            totalExpectedFees += expectedFee;
            
            uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
            vm.prank(trader2);
            claws.buyClaws{value: price}(agent1, 1, price);
        }
        
        // Verify and claim (resets pending but not lifetime)
        vm.prank(agent1);
        claws.verifyAndClaim();
        
        // More trades after verification
        for (uint i = 0; i < 2; i++) {
            uint256 basePrice = claws.getBuyPrice(agent1, 1);
            uint256 expectedFee = basePrice * claws.agentFeePercent() / 1 ether;
            totalExpectedFees += expectedFee;
            
            uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
            vm.prank(trader2);
            claws.buyClaws{value: price}(agent1, 1, price);
        }
        
        assertEq(claws.lifetimeFees(agent1), totalExpectedFees);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_BondingCurvePricing(uint256 supply, uint256 amount) public view {
        // Bound to reasonable values to avoid overflow
        supply = bound(supply, 0, 10000);
        amount = bound(amount, 1, 100);
        
        uint256 price = claws.getPrice(supply, amount);
        
        // Price should always be >= 0
        assertGe(price, 0);
        
        // If supply > 10 and amount > 0, price should generally be > 0
        if (supply > 10 && amount > 0) {
            assertGt(price, 0);
        }
    }
    
    function testFuzz_SlippageProtection(uint256 amount) public {
        amount = bound(amount, 1, 50);
        
        _setupMarket(agent1);
        
        uint256 expectedCost = claws.getBuyPriceAfterFee(agent1, amount);
        
        // Should succeed with exact cost as maxCost
        vm.prank(trader2);
        claws.buyClaws{value: expectedCost}(agent1, amount, expectedCost);
        
        assertEq(claws.clawsBalance(agent1, trader2), amount);
    }
    
    // ============ Helpers ============
    
    function _setupMarket(address agent) internal {
        // Register agent in 8004
        registry.setBalance(agent, 1);
        
        // Create market
        uint256 price = claws.getBuyPriceAfterFee(agent, 1);
        vm.prank(trader1);
        claws.buyClaws{value: price}(agent, 1, price);
    }
}
