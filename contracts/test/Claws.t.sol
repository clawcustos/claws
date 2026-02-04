// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Claws} from "../src/Claws.sol";

contract ClawsTest is Test {
    Claws public claws;

    address public owner = address(1);
    address public protocol = address(2);
    address public agent1 = address(3);
    address public agent2 = address(4);
    address public user1 = address(5);
    address public user2 = address(6);

    function setUp() public {
        vm.prank(owner);
        claws = new Claws(protocol);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(claws.owner(), owner);
        assertEq(claws.protocolFeeDestination(), protocol);
        assertEq(claws.protocolFeePercent(), 50000000000000000);
        assertEq(claws.agentFeePercent(), 50000000000000000);
    }

    function test_Constructor_RevertZeroAddress() public {
        vm.expectRevert(Claws.ZeroAddress.selector);
        new Claws(address(0));
    }

    // ============ Verification Tests ============

    function test_VerifyAgent() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test_agent");

        assertTrue(claws.verifiedAgents(agent1));
        assertEq(claws.agentXHandle(agent1), "test_agent");
    }

    function test_VerifyAgent_RevertNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(Claws.NotOwner.selector);
        claws.verifyAgent(agent1, "test_agent");
    }

    function test_VerifyAgent_RevertZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Claws.ZeroAddress.selector);
        claws.verifyAgent(address(0), "test");
    }

    function test_UnverifyAgent() public {
        vm.startPrank(owner);
        claws.verifyAgent(agent1, "test_agent");
        assertTrue(claws.verifiedAgents(agent1));

        claws.unverifyAgent(agent1);
        assertFalse(claws.verifiedAgents(agent1));
        vm.stopPrank();
    }

    // ============ Pricing Tests ============

    function test_GetPrice_Supply0Amount1() public view {
        // First claw is free (0^2 / 16000 = 0)
        uint256 price = claws.getPrice(0, 1);
        assertEq(price, 0);
    }

    function test_GetPrice_Supply1Amount1() public view {
        // Second claw: 1^2 / 16000 = 0.0000625 ETH
        uint256 price = claws.getPrice(1, 1);
        assertEq(price, 62500000000000); // 0.0000625 ETH
    }

    function test_GetPrice_Supply10Amount1() public view {
        // 10^2 / 16000 = 0.00625 ETH
        uint256 price = claws.getPrice(10, 1);
        assertEq(price, 6250000000000000); // 0.00625 ETH
    }

    function test_GetPrice_Supply50Amount1() public view {
        // 50^2 / 16000 = 0.15625 ETH
        uint256 price = claws.getPrice(50, 1);
        assertEq(price, 156250000000000000); // 0.15625 ETH
    }

    function test_GetPrice_Supply100Amount1() public view {
        // 100^2 / 16000 = 0.625 ETH
        uint256 price = claws.getPrice(100, 1);
        assertEq(price, 625000000000000000); // 0.625 ETH
    }

    function test_GetBuyPriceAfterFee() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        // Simulate agent buying first claw
        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);

        // Check buy price for second claw
        uint256 basePrice = claws.getBuyPrice(agent1, 1);
        uint256 priceAfterFee = claws.getBuyPriceAfterFee(agent1, 1);

        // 10% fee
        assertEq(priceAfterFee, basePrice + (basePrice * 10 / 100));
    }

    // ============ Buy Tests ============

    function test_BuyClaws_FirstClawByAgent() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);

        assertEq(claws.clawsSupply(agent1), 1);
        assertEq(claws.clawsBalance(agent1, agent1), 1);
    }

    function test_BuyClaws_RevertNotVerified() public {
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert(Claws.AgentNotVerified.selector);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);
    }

    function test_BuyClaws_RevertAgentMustBuyFirst() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert(Claws.AgentMustBuyFirst.selector);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);
    }

    function test_BuyClaws_UserBuysAfterAgent() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        // Agent buys first
        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);

        // User buys second
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);

        assertEq(claws.clawsSupply(agent1), 2);
        assertEq(claws.clawsBalance(agent1, user1), 1);
    }

    function test_BuyClaws_FeesDistributed() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        // Agent buys first claw (free)
        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);

        uint256 protocolBefore = protocol.balance;
        uint256 agentBefore = agent1.balance;

        // User buys - should pay fees
        uint256 price = claws.getBuyPrice(agent1, 1);
        uint256 protocolFee = price * 5 / 100;
        uint256 agentFee = price * 5 / 100;

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        claws.buyClaws{value: price + protocolFee + agentFee}(agent1, 1);

        assertEq(protocol.balance - protocolBefore, protocolFee);
        assertEq(agent1.balance - agentBefore, agentFee);
    }

    function test_BuyClaws_RefundsExcess() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        vm.deal(agent1, 2 ether);
        uint256 balanceBefore = agent1.balance;

        vm.prank(agent1);
        claws.buyClaws{value: 1 ether}(agent1, 1);

        // First claw is free, should refund almost everything
        uint256 balanceAfter = agent1.balance;
        assertGt(balanceAfter, balanceBefore - 0.01 ether);
    }

    // ============ Sell Tests ============

    function test_SellClaws() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        // Agent buys 2 claws
        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.5 ether}(agent1, 2);

        assertEq(claws.clawsSupply(agent1), 2);

        // Agent sells 1 claw
        uint256 balanceBefore = agent1.balance;
        vm.prank(agent1);
        claws.sellClaws(agent1, 1);

        assertEq(claws.clawsSupply(agent1), 1);
        assertEq(claws.clawsBalance(agent1, agent1), 1);
        assertGt(agent1.balance, balanceBefore);
    }

    function test_SellClaws_RevertCannotSellLastClaw() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        // Agent buys 1 claw
        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.1 ether}(agent1, 1);

        // Try to sell - should fail
        vm.prank(agent1);
        vm.expectRevert(Claws.CannotSellLastClaw.selector);
        claws.sellClaws(agent1, 1);
    }

    function test_SellClaws_RevertInsufficientClaws() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        // Agent buys 2 claws
        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.5 ether}(agent1, 2);

        // User tries to sell without owning
        vm.prank(user1);
        vm.expectRevert(Claws.InsufficientClaws.selector);
        claws.sellClaws(agent1, 1);
    }

    // ============ Admin Tests ============

    function test_TransferOwnership() public {
        vm.prank(owner);
        claws.transferOwnership(user1);
        assertEq(claws.owner(), user1);
    }

    function test_TransferOwnership_RevertNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(Claws.NotOwner.selector);
        claws.transferOwnership(user2);
    }

    function test_SetProtocolFeeDestination() public {
        vm.prank(owner);
        claws.setProtocolFeeDestination(user1);
        assertEq(claws.protocolFeeDestination(), user1);
    }

    function test_SetFees() public {
        vm.prank(owner);
        claws.setFees(30000000000000000, 30000000000000000); // 3% each
        assertEq(claws.protocolFeePercent(), 30000000000000000);
        assertEq(claws.agentFeePercent(), 30000000000000000);
    }

    function test_SetFees_RevertFeesTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(Claws.FeesTooHigh.selector);
        claws.setFees(150000000000000000, 100000000000000000); // 15% + 10% = 25%
    }

    // ============ View Tests ============

    function test_GetClawsBalance() public {
        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        vm.deal(agent1, 1 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 0.5 ether}(agent1, 3);

        assertEq(claws.getClawsBalance(agent1, agent1), 3);
        assertEq(claws.getClawsBalance(agent1, user1), 0);
    }

    function test_IsVerified() public {
        assertFalse(claws.isVerified(agent1));

        vm.prank(owner);
        claws.verifyAgent(agent1, "test");

        assertTrue(claws.isVerified(agent1));
    }

    // ============ Integration Tests ============

    function test_FullFlow() public {
        // Setup
        vm.prank(owner);
        claws.verifyAgent(agent1, "test_agent");

        // Agent buys first claw
        vm.deal(agent1, 10 ether);
        vm.prank(agent1);
        claws.buyClaws{value: 1 ether}(agent1, 1);
        assertEq(claws.clawsSupply(agent1), 1);

        // User1 buys 5 claws
        vm.deal(user1, 10 ether);
        uint256 user1Cost = claws.getBuyPriceAfterFee(agent1, 5);
        vm.prank(user1);
        claws.buyClaws{value: user1Cost}(agent1, 5);
        assertEq(claws.clawsSupply(agent1), 6);
        assertEq(claws.clawsBalance(agent1, user1), 5);

        // User2 buys 3 claws
        vm.deal(user2, 10 ether);
        uint256 user2Cost = claws.getBuyPriceAfterFee(agent1, 3);
        vm.prank(user2);
        claws.buyClaws{value: user2Cost}(agent1, 3);
        assertEq(claws.clawsSupply(agent1), 9);

        // User1 sells 2 claws
        vm.prank(user1);
        claws.sellClaws(agent1, 2);
        assertEq(claws.clawsSupply(agent1), 7);
        assertEq(claws.clawsBalance(agent1, user1), 3);

        // Check protocol earned fees
        assertGt(protocol.balance, 0);
    }

    // ============ Fuzz Tests ============

    function testFuzz_GetPrice(uint256 supply, uint256 amount) public view {
        supply = bound(supply, 0, 10000);
        amount = bound(amount, 1, 100);

        uint256 price = claws.getPrice(supply, amount);
        // Price should increase with supply
        if (supply > 0) {
            uint256 pricePrev = claws.getPrice(supply - 1, amount);
            assertGe(price, pricePrev);
        }
    }
}
