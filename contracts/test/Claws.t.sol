// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Claws} from "../src/Claws.sol";

contract ClawsTest is Test {
    Claws public claws;
    
    address public owner = address(1);
    address public verifier = address(2);
    address public treasury = address(3);
    address public trader1 = address(4);
    address public trader2 = address(5);
    address public agentWallet = address(6);
    
    uint256 public verifierPk = 0xA11CE;
    
    string public constant HANDLE = "testhandle";
    string public constant HANDLE2 = "anotherhandle";
    
    function setUp() public {
        verifier = vm.addr(verifierPk);
        
        vm.prank(owner);
        claws = new Claws(verifier, treasury);
        
        vm.deal(trader1, 100 ether);
        vm.deal(trader2, 100 ether);
        vm.deal(agentWallet, 1 ether);
    }
    
    // ============ Deployment ============
    
    function test_Deployment() public view {
        assertEq(claws.owner(), owner);
        assertEq(claws.verifier(), verifier);
        assertEq(claws.treasury(), treasury);
        assertEq(claws.PROTOCOL_FEE_BPS(), 500);
        assertEq(claws.AGENT_FEE_BPS(), 500);
        assertEq(claws.PRICE_DIVISOR(), 16000);
    }
    
    function test_DeploymentRevertsZeroVerifier() public {
        vm.expectRevert(Claws.ZeroAddress.selector);
        new Claws(address(0), treasury);
    }
    
    function test_DeploymentRevertsZeroTreasury() public {
        vm.expectRevert(Claws.ZeroAddress.selector);
        new Claws(verifier, address(0));
    }
    
    // ============ Market Creation ============
    
    function test_CreateMarket() public {
        claws.createMarket(HANDLE);
        
        assertTrue(claws.marketExists(HANDLE));
        
        (uint256 supply,,,,,,uint256 createdAt,) = claws.getMarket(HANDLE);
        assertEq(supply, 0);
        assertGt(createdAt, 0);
    }
    
    function test_CreateMarketAutoCreatesOnBuy() public {
        assertFalse(claws.marketExists(HANDLE));
        
        uint256 price = claws.getBuyPriceByHandle(HANDLE, 1);
        uint256 totalCost = price + (price * 1000 / 10000); // 10% fees
        
        vm.prank(trader1);
        claws.buyClaws{value: totalCost + 0.01 ether}(HANDLE, 1);
        
        assertTrue(claws.marketExists(HANDLE));
    }
    
    function test_CreateMarketRevertsEmptyHandle() public {
        vm.expectRevert(Claws.InvalidHandle.selector);
        claws.createMarket("");
    }
    
    function test_CreateMarketRevertsLongHandle() public {
        string memory longHandle = "thishandleiswaytoolongtobevalidxxx";
        vm.expectRevert(Claws.InvalidHandle.selector);
        claws.createMarket(longHandle);
    }
    
    function test_CreateMarketRevertsAlreadyExists() public {
        claws.createMarket(HANDLE);
        vm.expectRevert(Claws.MarketAlreadyExists.selector);
        claws.createMarket(HANDLE);
    }
    
    // ============ Buy Claws ============
    
    function test_BuyClaws() public {
        uint256 price = claws.getBuyPriceByHandle(HANDLE, 1);
        uint256 protocolFee = price * 500 / 10000;
        uint256 agentFee = price * 500 / 10000;
        uint256 totalCost = price + protocolFee + agentFee;
        
        uint256 treasuryBefore = treasury.balance;
        
        vm.prank(trader1);
        claws.buyClaws{value: totalCost + 0.01 ether}(HANDLE, 1);
        
        assertEq(claws.getBalance(HANDLE, trader1), 1);
        
        (uint256 supply, uint256 pendingFees,,,,,, ) = claws.getMarket(HANDLE);
        assertEq(supply, 1);
        assertEq(pendingFees, agentFee);
        assertEq(treasury.balance - treasuryBefore, protocolFee);
    }
    
    function test_BuyMultipleClaws() public {
        (uint256 price,,,uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        
        vm.prank(trader1);
        claws.buyClaws{value: totalCost}(HANDLE, 5);
        
        assertEq(claws.getBalance(HANDLE, trader1), 5);
        
        (uint256 supply,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supply, 5);
    }
    
    function test_BuyClawsRefundsExcess() public {
        (,,,uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        uint256 excess = 1 ether;
        
        uint256 balanceBefore = trader1.balance;
        
        vm.prank(trader1);
        claws.buyClaws{value: totalCost + excess}(HANDLE, 1);
        
        assertEq(balanceBefore - trader1.balance, totalCost);
    }
    
    function test_BuyClawsRevertsZeroAmount() public {
        vm.prank(trader1);
        vm.expectRevert(Claws.InvalidAmount.selector);
        claws.buyClaws{value: 1 ether}(HANDLE, 0);
    }
    
    function test_BuyClawsRevertsInsufficientPayment() public {
        // First claw is free, so test with 2 claws (which costs 0.0000625 ETH + fees)
        vm.prank(trader1);
        vm.expectRevert(Claws.InsufficientPayment.selector);
        claws.buyClaws{value: 0.00001 ether}(HANDLE, 2);
    }
    
    // ============ Sell Claws ============
    
    function test_SellClaws() public {
        // First buy some claws
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        // Then sell some
        (uint256 sellPrice,,, uint256 proceeds) = claws.getSellProceedsBreakdown(HANDLE, 2);
        
        uint256 balanceBefore = trader1.balance;
        
        vm.prank(trader1);
        claws.sellClaws(HANDLE, 2, proceeds);
        
        assertEq(claws.getBalance(HANDLE, trader1), 3);
        assertEq(trader1.balance - balanceBefore, proceeds);
        
        (uint256 supply,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supply, 3);
    }
    
    function test_SellClawsRevertsInsufficientBalance() public {
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 1);
        
        vm.prank(trader1);
        vm.expectRevert(Claws.InsufficientBalance.selector);
        claws.sellClaws(HANDLE, 5, 0);
    }
    
    function test_SellClawsRevertsCannotSellLast() public {
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 1);
        
        vm.prank(trader1);
        vm.expectRevert(Claws.CannotSellLastClaw.selector);
        claws.sellClaws(HANDLE, 1, 0);
    }
    
    function test_SellClawsRevertsSlippageExceeded() public {
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        vm.prank(trader1);
        vm.expectRevert(Claws.SlippageExceeded.selector);
        claws.sellClaws(HANDLE, 2, 100 ether); // Unrealistic minProceeds
    }
    
    // ============ Price Calculations ============
    
    function test_BondingCurvePricing() public view {
        // First claw is FREE (friend.tech model): 0^2 / 16000 = 0
        uint256 price1 = claws.getBuyPriceByHandle(HANDLE, 1);
        assertEq(price1, 0);
        
        // Second claw: 1^2 / 16000 = 0.0000625 ETH
        // Buying 2 claws = 0 + 0.0000625 = 0.0000625 ETH
        uint256 price2 = claws.getBuyPriceByHandle(HANDLE, 2);
        assertEq(price2, 0.0000625 ether);
    }
    
    function test_GetCurrentPrice() public {
        // At supply=0, next claw price = 0^2/16000 = 0 (FREE)
        assertEq(claws.getCurrentPrice(HANDLE), 0);
        
        // Buy 1 claw (free)
        vm.prank(trader1);
        claws.buyClaws{value: 0}(HANDLE, 1);
        
        // At supply=1, next claw price = 1^2/16000 = 0.0000625 ETH
        assertEq(claws.getCurrentPrice(HANDLE), 0.0000625 ether);
    }
    
    function test_GetBuyCostBreakdown() public view {
        (uint256 price, uint256 protocolFee, uint256 agentFee, uint256 totalCost) = 
            claws.getBuyCostBreakdown(HANDLE, 1);
        
        assertEq(protocolFee, price * 500 / 10000);
        assertEq(agentFee, price * 500 / 10000);
        assertEq(totalCost, price + protocolFee + agentFee);
    }
    
    function test_GetSellProceedsBreakdown() public {
        // Buy first
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        (uint256 price, uint256 protocolFee, uint256 agentFee, uint256 proceeds) = 
            claws.getSellProceedsBreakdown(HANDLE, 2);
        
        assertEq(protocolFee, price * 500 / 10000);
        assertEq(agentFee, price * 500 / 10000);
        assertEq(proceeds, price - protocolFee - agentFee);
    }
    
    // ============ Verification ============
    
    function test_VerifyAndClaim() public {
        // Buy some claws first (generates fees)
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 10);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 10);
        
        (,uint256 pendingFees,,,,,,) = claws.getMarket(HANDLE);
        assertGt(pendingFees, 0);
        
        // Create verification signature
        uint256 timestamp = block.timestamp;
        uint256 nonce = 12345;
        
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        uint256 walletBefore = agentWallet.balance;
        
        vm.prank(agentWallet);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
        
        // Check verification state
        (,uint256 newPendingFees,,,address verifiedWallet, bool isVerified,,) = claws.getMarket(HANDLE);
        assertTrue(isVerified);
        assertEq(verifiedWallet, agentWallet);
        assertEq(newPendingFees, 0);
        assertEq(agentWallet.balance - walletBefore, pendingFees);
    }
    
    function test_VerifyRevertsInvalidSignature() public {
        claws.createMarket(HANDLE);
        
        uint256 timestamp = block.timestamp;
        uint256 nonce = 12345;
        
        // Sign with wrong key
        uint256 wrongPk = 0xBAD;
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(agentWallet);
        vm.expectRevert(Claws.InvalidSignature.selector);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
    }
    
    function test_VerifyRevertsAlreadyVerified() public {
        // First verify
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 1);
        
        uint256 timestamp = block.timestamp;
        uint256 nonce = 12345;
        
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(agentWallet);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
        
        // Try to verify again
        uint256 newNonce = 99999;
        messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, newNonce));
        ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (v, r, s) = vm.sign(verifierPk, ethSignedHash);
        signature = abi.encodePacked(r, s, v);
        
        vm.prank(agentWallet);
        vm.expectRevert(Claws.AlreadyVerified.selector);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, newNonce, signature);
    }
    
    // ============ Claim Fees ============
    
    function test_ClaimFees() public {
        // Buy claws, verify, then buy more to generate new fees
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        // Verify
        uint256 timestamp = block.timestamp;
        uint256 nonce = 12345;
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(agentWallet);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
        
        // Buy more (generates new fees)
        (,,,uint256 buyCost2) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader2);
        claws.buyClaws{value: buyCost2}(HANDLE, 5);
        
        (,uint256 pendingFees,,,,,,) = claws.getMarket(HANDLE);
        assertGt(pendingFees, 0);
        
        uint256 walletBefore = agentWallet.balance;
        
        vm.prank(agentWallet);
        claws.claimFees(HANDLE);
        
        assertEq(agentWallet.balance - walletBefore, pendingFees);
        
        (,uint256 newPendingFees,,,,,,) = claws.getMarket(HANDLE);
        assertEq(newPendingFees, 0);
    }
    
    function test_ClaimFeesRevertsNotVerified() public {
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        vm.prank(agentWallet);
        vm.expectRevert(Claws.NotVerified.selector);
        claws.claimFees(HANDLE);
    }
    
    function test_ClaimFeesRevertsWrongWallet() public {
        // Buy and verify
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        uint256 timestamp = block.timestamp;
        uint256 nonce = 12345;
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(agentWallet);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
        
        // Buy more
        (,,,uint256 buyCost2) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader2);
        claws.buyClaws{value: buyCost2}(HANDLE, 5);
        
        // Wrong wallet tries to claim
        vm.prank(trader1);
        vm.expectRevert(Claws.NotVerified.selector);
        claws.claimFees(HANDLE);
    }
    
    // ============ Handle Normalization ============
    
    function test_HandleNormalization() public {
        // Create market with uppercase
        claws.createMarket("TestHandle");
        
        // Should be the same market as lowercase
        vm.expectRevert(Claws.MarketAlreadyExists.selector);
        claws.createMarket("testhandle");
    }
    
    // ============ Admin Functions ============
    
    function test_SetVerifier() public {
        address newVerifier = address(99);
        
        vm.prank(owner);
        claws.setVerifier(newVerifier);
        
        assertEq(claws.verifier(), newVerifier);
    }
    
    function test_SetVerifierRevertsNotOwner() public {
        vm.prank(trader1);
        vm.expectRevert();
        claws.setVerifier(address(99));
    }
    
    function test_SetTreasury() public {
        address newTreasury = address(88);
        
        vm.prank(owner);
        claws.setTreasury(newTreasury);
        
        assertEq(claws.treasury(), newTreasury);
    }
    
    function test_SetTreasuryRevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Claws.ZeroAddress.selector);
        claws.setTreasury(address(0));
    }
    
    // ============ Volume & Fee Tracking ============
    
    function test_LifetimeVolumeTracking() public {
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        (,,uint256 lifetimeFees, uint256 lifetimeVolume,,,,) = claws.getMarket(HANDLE);
        assertGt(lifetimeFees, 0);
        assertGt(lifetimeVolume, 0);
    }
    
    // ============ Multiple Markets ============
    
    function test_MultipleMarkets() public {
        (,,,uint256 cost1) = claws.getBuyCostBreakdown(HANDLE, 3);
        (,,,uint256 cost2) = claws.getBuyCostBreakdown(HANDLE2, 5);
        
        vm.prank(trader1);
        claws.buyClaws{value: cost1}(HANDLE, 3);
        
        vm.prank(trader1);
        claws.buyClaws{value: cost2}(HANDLE2, 5);
        
        assertEq(claws.getBalance(HANDLE, trader1), 3);
        assertEq(claws.getBalance(HANDLE2, trader1), 5);
        
        (uint256 supply1,,,,,,,) = claws.getMarket(HANDLE);
        (uint256 supply2,,,,,,,) = claws.getMarket(HANDLE2);
        
        assertEq(supply1, 3);
        assertEq(supply2, 5);
    }
    
    // ============ Pause Functionality ============
    
    function test_Pause() public {
        vm.prank(owner);
        claws.pause();
        
        assertTrue(claws.paused());
    }
    
    function test_PauseBlocksBuying() public {
        vm.prank(owner);
        claws.pause();
        
        vm.prank(trader1);
        vm.expectRevert();
        claws.buyClaws{value: 1 ether}(HANDLE, 1);
    }
    
    function test_PauseBlocksSelling() public {
        // Buy first
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        // Pause
        vm.prank(owner);
        claws.pause();
        
        // Try to sell
        vm.prank(trader1);
        vm.expectRevert();
        claws.sellClaws(HANDLE, 2, 0);
    }
    
    function test_Unpause() public {
        vm.prank(owner);
        claws.pause();
        assertTrue(claws.paused());
        
        vm.prank(owner);
        claws.unpause();
        assertFalse(claws.paused());
        
        // Can trade again
        vm.prank(trader1);
        claws.buyClaws{value: 0}(HANDLE, 1);
        assertEq(claws.getBalance(HANDLE, trader1), 1);
    }
    
    function test_PauseOnlyOwner() public {
        vm.prank(trader1);
        vm.expectRevert();
        claws.pause();
    }
    
    // ============ Verified Agent Gets Free Claw ============
    
    function test_VerifiedAgentGetsFreeClawOnVerify() public {
        // Buy some claws first (generates fees)
        (,,,uint256 buyCost) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader1);
        claws.buyClaws{value: buyCost}(HANDLE, 5);
        
        (uint256 supplyBefore,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supplyBefore, 5);
        
        // Verify agent
        uint256 timestamp = block.timestamp;
        uint256 nonce = 99999;
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(agentWallet);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
        
        // Agent should have 1 free claw
        assertEq(claws.getBalance(HANDLE, agentWallet), 1);
        
        // Supply should increase by 1
        (uint256 supplyAfter,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supplyAfter, 6);
    }
    
    // ============ First Claw Free ============
    
    function test_FirstClawIsFree() public {
        // First claw should cost 0
        (uint256 price,,,uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        assertEq(price, 0);
        assertEq(totalCost, 0); // 0 + 0 fees = 0
        
        // Can buy with 0 ETH
        vm.prank(trader1);
        claws.buyClaws{value: 0}(HANDLE, 1);
        
        assertEq(claws.getBalance(HANDLE, trader1), 1);
    }
}
