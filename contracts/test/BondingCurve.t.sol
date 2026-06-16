// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BondingCurve.sol";
import "../src/AgentToken.sol";

contract BondingCurveTest is Test {
    BondingCurve bondingCurve;
    AgentToken token;
    address buyer = address(0x123);
    address seller = address(0x456);
    address treasury = address(0xBEEF);

    // Local copies for vm.expectEmit (qualified Contract.Event needs solc >= 0.8.22).
    event Buy(address indexed buyer, address indexed token, uint256 amount, uint256 cost);
    event Sell(address indexed seller, address indexed token, uint256 amount, uint256 revenue);

    function setUp() public {
        bondingCurve = new BondingCurve(treasury);
        token = new AgentToken("Test Token", "TEST", address(0x789));

        // The curve dispenses tokens from its own inventory — seed it.
        token.mint(address(bondingCurve), 1_000_000 * 10 ** 18);

        vm.deal(buyer, 100 ether);
        vm.deal(seller, 100 ether);
        vm.prank(buyer);
        token.approve(address(bondingCurve), type(uint256).max);
        vm.prank(seller);
        token.approve(address(bondingCurve), type(uint256).max);
    }

    function testBuyPriceCalculation() public {
        uint256 amount = 100 * 10 ** 18;
        assertGt(bondingCurve.getBuyPrice(address(token), amount), 0, "Price should be > 0");
    }

    function testBuyCostIncludesFees() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 price = bondingCurve.getBuyPrice(address(token), amount);
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);
        // 2% total fee on top of the curve price.
        assertEq(cost, price + (price * 200) / 10000, "Cost should include 2% fees");
    }

    function testBuyTokens() public {
        uint256 amount = 100 * 10 ** 18;
        // Capture the curve price BEFORE the buy (supply changes after).
        uint256 priceBefore = bondingCurve.getBuyPrice(address(token), amount);
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);

        vm.prank(buyer);
        bondingCurve.buy{value: cost}(address(token), amount);

        assertEq(token.balanceOf(buyer), amount, "Buyer should receive tokens");
        assertEq(bondingCurve.getSupply(address(token)), amount, "Supply should match");
        // Reserve holds only the curve price, not the fees.
        assertEq(bondingCurve.getReserve(address(token)), priceBefore, "Reserve = curve price");
    }

    function testBuyPaysProtocolFeeToTreasury() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 price = bondingCurve.getBuyPrice(address(token), amount);
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);
        uint256 treasuryBefore = treasury.balance;

        vm.prank(buyer);
        bondingCurve.buy{value: cost}(address(token), amount);

        // No registered creator → creator fee also falls back to treasury (2% total).
        uint256 expectedFees = (price * 200) / 10000;
        assertEq(treasury.balance - treasuryBefore, expectedFees, "Treasury receives both fees");
    }

    function testBuyTokensWithExcessETHRefunds() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);
        uint256 balanceBefore = buyer.balance;

        vm.prank(buyer);
        bondingCurve.buy{value: cost + 1 ether}(address(token), amount);

        assertEq(balanceBefore - buyer.balance, cost, "Only total cost deducted");
    }

    function testBuyInsufficientPaymentReverts() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);

        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        bondingCurve.buy{value: cost - 1}(address(token), amount);
    }

    function testSellTokensNetOfFees() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);

        vm.prank(buyer);
        bondingCurve.buy{value: cost}(address(token), amount);

        uint256 revenue = bondingCurve.getSellPrice(address(token), amount);
        uint256 expectedPayout = bondingCurve.getSellProceeds(address(token), amount);
        uint256 balanceBefore = buyer.balance;

        vm.prank(buyer);
        bondingCurve.sell(address(token), amount);

        assertEq(buyer.balance - balanceBefore, expectedPayout, "Payout net of fees");
        assertLt(expectedPayout, revenue, "Payout should be less than gross revenue");
        assertEq(bondingCurve.getSupply(address(token)), 0, "Supply zero after full sell");
    }

    function testSellMoreThanSupplyReverts() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);
        vm.prank(buyer);
        bondingCurve.buy{value: cost}(address(token), amount);

        vm.prank(buyer);
        vm.expectRevert("Insufficient supply");
        bondingCurve.sell(address(token), amount + 100 * 10 ** 18);
    }

    function testCreatorEarnsFee() public {
        address creatorAddr = address(0xC0FFEE);
        // Owner can register a creator directly (no factory in this test).
        bondingCurve.registerToken(address(token), creatorAddr);

        uint256 amount = 100 * 10 ** 18;
        uint256 price = bondingCurve.getBuyPrice(address(token), amount);
        uint256 cost = bondingCurve.getBuyCost(address(token), amount);

        vm.prank(buyer);
        bondingCurve.buy{value: cost}(address(token), amount);

        // Creator gets 1% of the curve price.
        assertEq(creatorAddr.balance, (price * 100) / 10000, "Creator earns 1%");
    }

    function testMultipleBuyersPriceIncreases() public {
        address buyer2 = address(0x789);
        vm.deal(buyer2, 100 ether);
        uint256 amount = 100 * 10 ** 18;

        uint256 price1 = bondingCurve.getBuyPrice(address(token), amount);
        vm.prank(buyer);
        bondingCurve.buy{value: bondingCurve.getBuyCost(address(token), amount)}(address(token), amount);

        uint256 price2 = bondingCurve.getBuyPrice(address(token), amount);
        assertGt(price2, price1, "Price increases with supply");
    }

    function testBuyBelowMinimumReverts() public {
        vm.prank(buyer);
        vm.expectRevert("Amount below minimum");
        bondingCurve.buy{value: 0}(address(token), 0);
    }

    function testBuyWithoutInventoryReverts() public {
        AgentToken empty = new AgentToken("Empty", "EMP", address(0x789));
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyCost(address(empty), amount);
        vm.prank(buyer);
        vm.expectRevert("Insufficient curve inventory");
        bondingCurve.buy{value: cost}(address(empty), amount);
    }

    receive() external payable {}
}
