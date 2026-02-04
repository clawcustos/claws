// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Claws} from "../src/Claws.sol";

contract ClawsTest is Test {
    Claws public claws;
    
    address public owner = address(1);
    address public verifier = address(2);
    address public treasury = address(3);
    address public agent1 = address(4);
    address public agent2 = address(5);
    address public trader1 = address(6);
    address public trader2 = address(7);
    
    function setUp() public {
        vm.prank(owner);
        claws = new Claws(treasury, verifier);
        
        // Fund accounts
        vm.deal(agent1, 10 ether);
        vm.deal(agent2, 10 ether);
        vm.deal(trader1, 10 ether);
        vm.deal(trader2, 10 ether);
    }
    
    // ============ Deployment ============
    
    function test_Deployment() public view {
        assertEq(claws.owner(), owner);
        assertEq(claws.verifier(), verifier);
        assertEq(claws.protocolFeeDestination(), treasury);
        assertEq(claws.protocolFeePercent(), 50000000000000000); // 5%
        assertEq(claws.agentFeePercent(), 50000000000000000); // 5%
    }
    
    // ============ Source Verification ============
    
    function test_AddSourceVerifiedAgent() public {
        vm.prank(verifier);
        claws.addSourceVerifiedAgent(agent1, "agent1_x", "moltbook_123");
        
        assertTrue(claws.sourceVerified(agent1));
        assertEq(claws.agentXHandle(agent1), "agent1_x");
        assertEq(claws.agentMoltbookId(agent1), "moltbook_123");
    }
    
    function test_AddSourceVerifiedAgent_ByOwner() public {
        vm.prank(owner);
        claws.addSourceVerifiedAgent(agent1, "agent1_x", "");
        
        assertTrue(claws.sourceVerified(agent1));
    }
    
    function test_AddSourceVerifiedAgent_RevertNotVerifier() public {
        vm.prank(trader1);
        vm.expectRevert(Claws.NotVerifier.selector);
        claws.addSourceVerifiedAgent(agent1, "agent1_x", "");
    }
    
    function test_AddSourceVerifiedAgentBatch() public {
        address[] memory agents = new address[](2);
        agents[0] = agent1;
        agents[1] = agent2;
        
        string[] memory handles = new string[](2);
        handles[0] = "agent1_x";
        handles[1] = "agent2_x";
        
        string[] memory moltbookIds = new string[](2);
        moltbookIds[0] = "molt_1";
        moltbookIds[1] = "molt_2";
        
        vm.prank(verifier);
        claws.addSourceVerifiedAgentBatch(agents, handles, moltbookIds);
        
        assertTrue(claws.sourceVerified(agent1));
        assertTrue(claws.sourceVerified(agent2));
    }
    
    // ============ Market Creation ============
    
    function test_CreateMarket() public {
        // Add source-verified agent
        vm.prank(verifier);
        claws.addSourceVerifiedAgent(agent1, "agent1_x", "");
        
        // Trader creates market by buying first claw
        uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
        
        vm.prank(trader1);
        claws.buyClaws{value: price}(agent1, 1);
        
        assertEq(claws.clawsSupply(agent1), 1);
        assertEq(claws.clawsBalance(agent1, trader1), 1);
        assertTrue(claws.marketExists(agent1));
    }
    
    function test_CreateMarket_RevertNotSourceVerified() public {
        uint256 price = 0.001 ether;
        
        vm.prank(trader1);
        vm.expectRevert(Claws.AgentNotSourceVerified.selector);
        claws.buyClaws{value: price}(agent1, 1);
    }
    
    // ============ Trading ============
    
    function test_BuyClaws() public {
        _setupMarket(agent1);
        
        uint256 price = claws.getBuyPriceAfterFee(agent1, 2);
        
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 2);
        
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
        claws.buyClaws{value: totalCost}(agent1, 1);
        
        // Fees should accumulate since agent not claws-verified
        assertEq(claws.pendingFees(agent1), agentFee);
    }
    
    function test_SellClaws() public {
        _setupMarket(agent1);
        
        // Buy more claws first (for agent1)
        uint256 buyPrice = claws.getBuyPriceAfterFee(agent1, 2);
        vm.prank(trader1);
        claws.buyClaws{value: buyPrice}(agent1, 2);
        
        // Now trader1 has 3 claws, sell 1
        uint256 balanceBefore = trader1.balance;
        
        vm.prank(trader1);
        claws.sellClaws(agent1, 1);
        
        assertEq(claws.clawsBalance(agent1, trader1), 2);
        assertGt(trader1.balance, balanceBefore);
    }
    
    function test_SellClaws_RevertCannotSellLastClaw() public {
        _setupMarket(agent1);
        
        vm.prank(trader1);
        vm.expectRevert(Claws.CannotSellLastClaw.selector);
        claws.sellClaws(agent1, 1);
    }
    
    function test_SellClaws_RevertInsufficientClaws() public {
        _setupMarket(agent1);
        
        // trader1 has 1, buy more with trader1 to increase supply
        uint256 price1 = claws.getBuyPriceAfterFee(agent1, 4);
        vm.prank(trader1);
        claws.buyClaws{value: price1}(agent1, 4);
        
        // trader2 buys 1
        uint256 price2 = claws.getBuyPriceAfterFee(agent1, 1);
        vm.prank(trader2);
        claws.buyClaws{value: price2}(agent1, 1);
        
        // Supply is now 6, trader2 has 1
        // trader2 tries to sell 2 (more than they have, supply > amount so passes first check)
        vm.prank(trader2);
        vm.expectRevert(Claws.InsufficientClaws.selector);
        claws.sellClaws(agent1, 2);
    }
    
    // ============ Agent Verification & Claim ============
    
    function test_VerifyAndClaim() public {
        _setupMarket(agent1);
        
        // Generate some fees
        uint256 price = claws.getBuyPriceAfterFee(agent1, 2);
        vm.prank(trader2);
        claws.buyClaws{value: price}(agent1, 2);
        
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
        claws.buyClaws{value: price}(agent1, 1);
        
        // Fees should go directly to agent
        assertEq(claws.pendingFees(agent1), 0);
        assertEq(agent1.balance, agentBalanceBefore + expectedAgentFee);
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
            bool sourceV,
            bool clawsV,
            bool claimed,
            uint256 pending,
            uint256 supply
        ) = claws.getAgentStatus(agent1);
        
        assertTrue(sourceV);
        assertFalse(clawsV);
        assertFalse(claimed);
        assertEq(pending, 0); // No fees yet from first buy (price is 0)
        assertEq(supply, 1);
    }
    
    // ============ Admin ============
    
    function test_SetVerifier() public {
        address newVerifier = address(99);
        
        vm.prank(owner);
        claws.setVerifier(newVerifier);
        
        assertEq(claws.verifier(), newVerifier);
    }
    
    function test_SetVerifier_RevertNotOwner() public {
        vm.prank(trader1);
        vm.expectRevert(Claws.NotOwner.selector);
        claws.setVerifier(address(99));
    }
    
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
        claws.buyClaws{value: price + excess}(agent1, 1);
        
        // Should have been refunded the excess
        assertEq(trader2.balance, balanceBefore - price);
    }
    
    function test_MultipleTrades() public {
        _setupMarket(agent1);
        
        // Multiple buys
        for (uint i = 0; i < 5; i++) {
            uint256 price = claws.getBuyPriceAfterFee(agent1, 1);
            vm.prank(trader2);
            claws.buyClaws{value: price}(agent1, 1);
        }
        
        assertEq(claws.clawsBalance(agent1, trader2), 5);
        assertEq(claws.clawsSupply(agent1), 6); // 1 initial + 5 new
        
        // Verify fees accumulated
        assertGt(claws.pendingFees(agent1), 0);
    }
    
    // ============ Helpers ============
    
    function _setupMarket(address agent) internal {
        // Add source verification
        vm.prank(verifier);
        claws.addSourceVerifiedAgent(agent, "agent_x", "molt_123");
        
        // Create market
        uint256 price = claws.getBuyPriceAfterFee(agent, 1);
        vm.prank(trader1);
        claws.buyClaws{value: price}(agent, 1);
    }
}
