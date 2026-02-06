// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Claws} from "../src/Claws.sol";

contract ClawsTest is Test {
    Claws public claws;

    // Events to test
    event WhitelistUpdated(bytes32 indexed handleHash, string handle, bool status);
    
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
        // Test with 2 claws (which costs 0.0000625 ETH + fees)
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
        // At supply=0, buying 1 claw: sum of squares from 0 to 0 = 0^2 = 0
        uint256 price1 = claws.getBuyPriceByHandle(HANDLE, 1);
        assertEq(price1, 0);

        // At supply=0, buying 2 claws: sum of squares from 0 to 1 = 0^2 + 1^2 = 1
        // Price = 1 * 1 ether / 16000 = 0.0000625 ETH
        uint256 price2 = claws.getBuyPriceByHandle(HANDLE, 2);
        assertEq(price2, 0.0000625 ether);
    }
    
    function test_GetCurrentPrice() public {
        // Whitelist handle for free first claw behavior
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        // At supply=0, next claw price = 0^2/16000 = 0
        assertEq(claws.getCurrentPrice(HANDLE), 0);

        // Buy 1 claw (free for whitelisted, gets bonus)
        vm.prank(trader1);
        claws.buyClaws{value: 0}(HANDLE, 1);

        // At supply=2 (1 + 1 bonus), next claw price = 2^2/16000 = 0.00025 ETH
        assertEq(claws.getCurrentPrice(HANDLE), 0.00025 ether);
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

    function test_UpdateAgentWallet() public {
        // Setup: Buy claws and verify
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

        // Owner updates wallet
        address newWallet = address(99);
        vm.prank(owner);
        claws.updateAgentWallet(HANDLE, newWallet);

        (,,,,address verifiedWallet, bool isVerified,,) = claws.getMarket(HANDLE);
        assertEq(verifiedWallet, newWallet);
        assertTrue(isVerified);
    }

    function test_UpdateAgentWalletRevertsNotOwner() public {
        // Setup: Buy claws and verify
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

        // Non-owner tries to update
        address newWallet = address(99);
        vm.prank(trader1);
        vm.expectRevert();
        claws.updateAgentWallet(HANDLE, newWallet);
    }

    function test_UpdateAgentWalletRevertsZeroAddress() public {
        // Setup: Buy claws and verify
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

        // Owner tries to set zero address
        vm.prank(owner);
        vm.expectRevert(Claws.ZeroAddress.selector);
        claws.updateAgentWallet(HANDLE, address(0));
    }

    function test_UpdateAgentWalletRevertsMarketNotVerified() public {
        // Create market but don't verify
        claws.createMarket(HANDLE);

        // Owner tries to update wallet on unverified market
        vm.prank(owner);
        vm.expectRevert(Claws.MarketNotVerified.selector);
        claws.updateAgentWallet(HANDLE, address(99));
    }

    function test_RevokeVerification() public {
        // Setup: Buy claws and verify
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

        // Owner revokes verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        (,,,,address verifiedWallet, bool isVerified,,) = claws.getMarket(HANDLE);
        assertEq(verifiedWallet, address(0));
        assertFalse(isVerified);
    }

    function test_RevokeVerificationRevertsNotOwner() public {
        // Setup: Buy claws and verify
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

        // Non-owner tries to revoke
        vm.prank(trader1);
        vm.expectRevert();
        claws.revokeVerification(HANDLE);
    }

    function test_RevokeVerificationRevertsMarketNotVerified() public {
        // Create market but don't verify
        claws.createMarket(HANDLE);

        // Owner tries to revoke unverified market
        vm.prank(owner);
        vm.expectRevert(Claws.MarketNotVerified.selector);
        claws.revokeVerification(HANDLE);
    }

    function test_ClaimFeesFailsAfterRevocation() public {
        // Setup: Buy claws, verify, buy more to generate fees
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

        // Buy more to generate fees
        (,,,uint256 buyCost2) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader2);
        claws.buyClaws{value: buyCost2}(HANDLE, 5);

        // Revoke verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        // Original wallet should not be able to claim fees anymore
        vm.prank(agentWallet);
        vm.expectRevert(Claws.NotVerified.selector);
        claws.claimFees(HANDLE);
    }

    function test_PendingFeesRemainAfterRevocation() public {
        // Setup: Buy claws, verify, buy more to generate fees
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

        // Buy more to generate fees
        (,,,uint256 buyCost2) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader2);
        claws.buyClaws{value: buyCost2}(HANDLE, 5);

        // Check pending fees
        (,uint256 pendingFeesBefore,,,,,,) = claws.getMarket(HANDLE);
        assertGt(pendingFeesBefore, 0);

        // Revoke verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        // Pending fees should remain
        (,uint256 pendingFeesAfter,,,,,,) = claws.getMarket(HANDLE);
        assertEq(pendingFeesAfter, pendingFeesBefore);
    }

    function test_SupplyAndBalancesUnchangedAfterRevocation() public {
        // Setup: Buy claws and verify
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

        uint256 supplyBefore = claws.getBalance(HANDLE, agentWallet);
        (uint256 marketSupplyBefore,,,,,,,) = claws.getMarket(HANDLE);

        // Revoke verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        // Agent's balance should remain unchanged
        assertEq(claws.getBalance(HANDLE, agentWallet), supplyBefore);

        // Market supply should remain unchanged
        (uint256 marketSupplyAfter,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(marketSupplyAfter, marketSupplyBefore);
    }

    function test_AgentCanReverifyAfterRevocation() public {
        // Setup: Buy claws and verify
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

        // Revoke verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        // Re-verify with same wallet
        uint256 newTimestamp = block.timestamp + 1;
        uint256 newNonce = 99999;
        bytes32 newMessageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, newTimestamp, newNonce));
        bytes32 newEthSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", newMessageHash));
        (v, r, s) = vm.sign(verifierPk, newEthSignedHash);
        signature = abi.encodePacked(r, s, v);

        vm.prank(agentWallet);
        claws.verifyAndClaim(HANDLE, agentWallet, newTimestamp, newNonce, signature);

        (,,,,address verifiedWallet, bool isVerified,,) = claws.getMarket(HANDLE);
        assertTrue(isVerified);
        assertEq(verifiedWallet, agentWallet);
    }

    function test_AgentCanReverifyWithDifferentWalletAfterRevocation() public {
        // Setup: Buy claws and verify
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

        // Revoke verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        // Re-verify with a different wallet
        address newWallet = address(99);
        uint256 newTimestamp = block.timestamp + 1;
        uint256 newNonce = 99999;
        bytes32 newMessageHash = keccak256(abi.encodePacked(HANDLE, newWallet, newTimestamp, newNonce));
        bytes32 newEthSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", newMessageHash));
        (v, r, s) = vm.sign(verifierPk, newEthSignedHash);
        signature = abi.encodePacked(r, s, v);

        vm.prank(newWallet);
        claws.verifyAndClaim(HANDLE, newWallet, newTimestamp, newNonce, signature);

        (,,,,address verifiedWallet, bool isVerified,,) = claws.getMarket(HANDLE);
        assertTrue(isVerified);
        assertEq(verifiedWallet, newWallet);
    }

    function test_PendingFeesClaimableAfterReverification() public {
        // Setup: Buy claws, verify, buy more to generate fees
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

        // Buy more to generate fees
        (,,,uint256 buyCost2) = claws.getBuyCostBreakdown(HANDLE, 5);
        vm.prank(trader2);
        claws.buyClaws{value: buyCost2}(HANDLE, 5);

        // Track pending fees before revocation
        (,uint256 pendingFees,,,,,,) = claws.getMarket(HANDLE);
        assertGt(pendingFees, 0);

        // Revoke verification
        vm.prank(owner);
        claws.revokeVerification(HANDLE);

        // Re-verify
        address newWallet = address(99);
        vm.deal(newWallet, 1 ether);
        uint256 newTimestamp = block.timestamp + 1;
        uint256 newNonce = 99999;
        bytes32 newMessageHash = keccak256(abi.encodePacked(HANDLE, newWallet, newTimestamp, newNonce));
        bytes32 newEthSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", newMessageHash));
        (v, r, s) = vm.sign(verifierPk, newEthSignedHash);
        signature = abi.encodePacked(r, s, v);

        uint256 walletBefore = newWallet.balance;

        vm.prank(newWallet);
        claws.verifyAndClaim(HANDLE, newWallet, newTimestamp, newNonce, signature);

        // New wallet should receive the pending fees that were frozen during revocation
        assertEq(newWallet.balance - walletBefore, pendingFees);
    }

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
        // Whitelist handle for free first claw
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        vm.prank(owner);
        claws.pause();
        assertTrue(claws.paused());

        vm.prank(owner);
        claws.unpause();
        assertFalse(claws.paused());

        // Can trade again (whitelisted gets bonus)
        vm.prank(trader1);
        claws.buyClaws{value: 0}(HANDLE, 1);
        assertEq(claws.getBalance(HANDLE, trader1), 2); // 1 + 1 bonus
    }
    
    function test_PauseOnlyOwner() public {
        vm.prank(trader1);
        vm.expectRevert();
        claws.pause();
    }
    
    // ============ Verified Agent Gets Free Claw ============
    
    function test_VerifiedAgentDoesNotGetFreeClawOnVerify() public {
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
        
        // Agent should NOT have any claws (no free claw on verification)
        assertEq(claws.getBalance(HANDLE, agentWallet), 0);
        
        // Supply should remain unchanged
        (uint256 supplyAfter,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supplyAfter, 5);
    }
    
    function test_VerifyRevertsExpiredSignature() public {
        claws.createMarket(HANDLE);
        
        uint256 timestamp = block.timestamp;
        uint256 nonce = 12345;
        
        bytes32 messageHash = keccak256(abi.encodePacked(HANDLE, agentWallet, timestamp, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPk, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Warp forward 2 hours (past the 1-hour expiry)
        vm.warp(block.timestamp + 7200);
        
        vm.prank(agentWallet);
        vm.expectRevert(Claws.SignatureExpired.selector);
        claws.verifyAndClaim(HANDLE, agentWallet, timestamp, nonce, signature);
    }
    
    // ============ Whitelist Tier System ============

    function test_SetWhitelisted() public {
        // Owner can whitelist
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        assertTrue(claws.isWhitelisted(HANDLE));
        assertTrue(claws.whitelisted(keccak256(abi.encodePacked(HANDLE))));

        // Owner can unwhitelist
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, false);

        assertFalse(claws.isWhitelisted(HANDLE));
    }

    function test_SetWhitelistedRevertsNotOwner() public {
        vm.prank(trader1);
        vm.expectRevert();
        claws.setWhitelisted(HANDLE, true);
    }

    function test_SetWhitelistedBatch() public {
        string[] memory handles = new string[](3);
        handles[0] = HANDLE;
        handles[1] = HANDLE2;
        handles[2] = "thirdhandle";

        vm.prank(owner);
        claws.setWhitelistedBatch(handles, true);

        assertTrue(claws.isWhitelisted(HANDLE));
        assertTrue(claws.isWhitelisted(HANDLE2));
        assertTrue(claws.isWhitelisted("thirdhandle"));
    }

    function test_SetWhitelistedBatchRevertsNotOwner() public {
        string[] memory handles = new string[](2);
        handles[0] = HANDLE;
        handles[1] = HANDLE2;

        vm.prank(trader1);
        vm.expectRevert();
        claws.setWhitelistedBatch(handles, true);
    }

    function test_IsWhitelisted() public {
        assertFalse(claws.isWhitelisted(HANDLE));

        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        assertTrue(claws.isWhitelisted(HANDLE));
    }

    function test_WhitelistedFirstBuyGetsBonusClaw() public {
        // Whitelist the handle
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        // First buy: pay for 1 claw, receive 2 (bonus)
        (uint256 price, uint256 protocolFee, uint256 agentFee, uint256 totalCost) =
            claws.getBuyCostBreakdown(HANDLE, 1);

        // Price for 1 claw at supply 0
        assertEq(price, 0); // Still 0 at supply 0

        vm.prank(trader1);
        claws.buyClaws{value: totalCost}(HANDLE, 1);

        // Should have 2 claws (1 paid + 1 bonus)
        assertEq(claws.getBalance(HANDLE, trader1), 2);

        // Supply should be 2
        (uint256 supply,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supply, 2);
    }

    function test_WhitelistedFirstBuyMultipleGetsBonusClaw() public {
        // Whitelist the handle
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        // Buy 3 claws: pay for 3, receive 4 (1 bonus)
        (,,, uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 3);

        vm.prank(trader1);
        claws.buyClaws{value: totalCost}(HANDLE, 3);

        // Should have 4 claws (3 paid + 1 bonus)
        assertEq(claws.getBalance(HANDLE, trader1), 4);

        // Supply should be 4
        (uint256 supply,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supply, 4);
    }

    function test_NonWhitelistedFirstBuyOneClawReverts() public {
        // Not whitelisted
        assertFalse(claws.isWhitelisted(HANDLE));

        // First buy of 1 claw should revert (must buy >= 2)
        vm.prank(trader1);
        vm.expectRevert(Claws.InvalidAmount.selector);
        claws.buyClaws{value: 1 ether}(HANDLE, 1);
    }

    function test_NonWhitelistedFirstBuyTwoClawsWorks() public {
        // Not whitelisted
        assertFalse(claws.isWhitelisted(HANDLE));

        // First buy of 2 claws should work
        (,,, uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 2);

        vm.prank(trader1);
        claws.buyClaws{value: totalCost}(HANDLE, 2);

        // Should have exactly 2 claws (no bonus)
        assertEq(claws.getBalance(HANDLE, trader1), 2);

        // Supply should be 2
        (uint256 supply,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supply, 2);
    }

    function test_NonWhitelistedFirstBuyFiveClawsWorks() public {
        // Not whitelisted
        assertFalse(claws.isWhitelisted(HANDLE));

        // First buy of 5 claws should work
        (,,, uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 5);

        vm.prank(trader1);
        claws.buyClaws{value: totalCost}(HANDLE, 5);

        // Should have exactly 5 claws (no bonus)
        assertEq(claws.getBalance(HANDLE, trader1), 5);
    }

    function test_AfterFirstBuyBothTiersBehaveIdentically() public {
        // Whitelist HANDLE, not HANDLE2
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        // First buy on whitelisted market (gets bonus)
        (,,, uint256 whitelistedCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader1);
        claws.buyClaws{value: whitelistedCost}(HANDLE, 1);
        assertEq(claws.getBalance(HANDLE, trader1), 2); // 1 + 1 bonus

        // First buy on non-whitelisted market (no bonus)
        (,,, uint256 nonWhitelistedCost) = claws.getBuyCostBreakdown(HANDLE2, 2);
        vm.prank(trader2);
        claws.buyClaws{value: nonWhitelistedCost}(HANDLE2, 2);
        assertEq(claws.getBalance(HANDLE2, trader2), 2);

        // Now both markets have supply >= 2
        // Buying more should behave the same

        // Buy 3 more on whitelisted market
        (uint256 wPriceBefore,,,) = claws.getBuyCostBreakdown(HANDLE, 3);
        (,,, uint256 wCost) = claws.getBuyCostBreakdown(HANDLE, 3);
        vm.prank(trader1);
        claws.buyClaws{value: wCost}(HANDLE, 3);

        // Buy 3 more on non-whitelisted market
        (uint256 nwPriceBefore,,,) = claws.getBuyCostBreakdown(HANDLE2, 3);
        (,,, uint256 nwCost) = claws.getBuyCostBreakdown(HANDLE2, 3);
        vm.prank(trader2);
        claws.buyClaws{value: nwCost}(HANDLE2, 3);

        // Prices should be the same (supply is 2 in both markets, buying 3)
        assertEq(wPriceBefore, nwPriceBefore);

        // No more bonus claws on either market
        assertEq(claws.getBalance(HANDLE, trader1), 5); // 2 + 3
        assertEq(claws.getBalance(HANDLE2, trader2), 5); // 2 + 3
    }

    function test_WhitelistCanBeToggled() public {
        // Whitelist then unwhitelist
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);
        assertTrue(claws.isWhitelisted(HANDLE));

        vm.prank(owner);
        claws.setWhitelisted(HANDLE, false);
        assertFalse(claws.isWhitelisted(HANDLE));

        // Can whitelist again
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);
        assertTrue(claws.isWhitelisted(HANDLE));
    }

    function test_WhitelistRemovedDoesNotAffectExistingMarkets() public {
        // Whitelist and create market
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        (,,, uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader1);
        claws.buyClaws{value: totalCost}(HANDLE, 1);

        // Unwhitelist
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, false);

        // Existing supply and balances unchanged
        (uint256 supply,,,,,,,) = claws.getMarket(HANDLE);
        assertEq(supply, 2); // 1 + 1 bonus
        assertEq(claws.getBalance(HANDLE, trader1), 2);

        // New purchases should work normally (no first buy restriction since supply > 0)
        (,,, uint256 cost2) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader2);
        claws.buyClaws{value: cost2}(HANDLE, 1);
        assertEq(claws.getBalance(HANDLE, trader2), 1);
    }

    function test_WhitelistPriceIsCorrect() public {
        // Price for whitelisted first buy (1 claw)
        // Should be 0 since supply=0
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        uint256 price = claws.getBuyPriceByHandle(HANDLE, 1);
        assertEq(price, 0);

        // Current price for next claw
        uint256 currentPrice = claws.getCurrentPrice(HANDLE);
        assertEq(currentPrice, 0);
    }

    function test_NonWhitelistedPriceIsCorrect() public {
        // Price for non-whitelisted must be calculated for 2 claws
        // At supply=0, buying 2 claws: sum of squares from 0 to 1
        // = 0² + 1² = 0 + 1 = 1
        // Price = 1 * 1 ether / 16000 = 0.0000625 ether
        uint256 price = claws.getBuyPriceByHandle(HANDLE, 2);
        assertEq(price, 0.0000625 ether);
    }

    function test_PriceAfterFirstBuySameForBoth() public {
        // Set up whitelisted market
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);
        (,,, uint256 wCost1) = claws.getBuyCostBreakdown(HANDLE, 1);
        vm.prank(trader1);
        claws.buyClaws{value: wCost1}(HANDLE, 1);

        // Set up non-whitelisted market
        (,,, uint256 nwCost1) = claws.getBuyCostBreakdown(HANDLE2, 2);
        vm.prank(trader2);
        claws.buyClaws{value: nwCost1}(HANDLE2, 2);

        // Both markets now have supply 2
        // Price for buying 1 more claw should be identical
        uint256 wPrice = claws.getBuyPriceByHandle(HANDLE, 1);
        uint256 nwPrice = claws.getBuyPriceByHandle(HANDLE2, 1);
        assertEq(wPrice, nwPrice);

        // Current price should also be identical
        uint256 wCurrent = claws.getCurrentPrice(HANDLE);
        uint256 nwCurrent = claws.getCurrentPrice(HANDLE2);
        assertEq(wCurrent, nwCurrent);
    }

    function test_WhitelistedEventEmitted() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit WhitelistUpdated(keccak256(abi.encodePacked(HANDLE)), HANDLE, true);
        claws.setWhitelisted(HANDLE, true);
    }

    function test_BatchWhitelistEventsEmitted() public {
        string[] memory handles = new string[](2);
        handles[0] = HANDLE;
        handles[1] = HANDLE2;

        vm.prank(owner);
        // Expect 2 events to be emitted
        vm.expectEmit(true, false, false, true);
        emit WhitelistUpdated(keccak256(abi.encodePacked(HANDLE)), HANDLE, true);
        vm.expectEmit(true, false, false, true);
        emit WhitelistUpdated(keccak256(abi.encodePacked(HANDLE2)), HANDLE2, true);

        claws.setWhitelistedBatch(handles, true);
    }

    function test_FirstClawIsFreeForWhitelisted() public {
        // Whitelist the handle
        vm.prank(owner);
        claws.setWhitelisted(HANDLE, true);

        // First claw should cost 0 (whitelisted)
        (uint256 price,,, uint256 totalCost) = claws.getBuyCostBreakdown(HANDLE, 1);
        assertEq(price, 0);
        assertEq(totalCost, 0); // 0 + 0 fees = 0

        // Can buy with 0 ETH and get bonus claw
        vm.prank(trader1);
        claws.buyClaws{value: 0}(HANDLE, 1);

        assertEq(claws.getBalance(HANDLE, trader1), 2); // 1 + 1 bonus
    }

    function test_FirstClawNotFreeForNonWhitelisted() public {
        // Not whitelisted
        assertFalse(claws.isWhitelisted(HANDLE));

        // First claw is NOT free - can't buy just 1
        vm.prank(trader1);
        vm.expectRevert(Claws.InvalidAmount.selector);
        claws.buyClaws{value: 0}(HANDLE, 1);

        // Must buy at least 2
        (uint256 price,,,) = claws.getBuyCostBreakdown(HANDLE, 2);
        assertGt(price, 0);
    }
}
