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

    function setUp() public {
        bondingCurve = new BondingCurve();
        token = new AgentToken("Test Token", "TEST", address(0x789));

        // Mint tokens for testing
        token.mint(buyer, 1_000_000 * 10 ** 18);
        token.mint(seller, 1_000_000 * 10 ** 18);

        // Approve bondingCurve to spend tokens
        vm.prank(buyer);
        token.approve(address(bondingCurve), type(uint256).max);

        vm.prank(seller);
        token.approve(address(bondingCurve), type(uint256).max);
    }

    function testBuyPriceCalculation() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 price = bondingCurve.getBuyPrice(address(token), amount);

        assertGt(price, 0, "Price should be greater than 0");
    }

    function testBuySellPriceConsistency() public {
        uint256 buyAmount = 100 * 10 ** 18;
        uint256 buyPrice = bondingCurve.getBuyPrice(address(token), buyAmount);

        // After buying, selling should return approximately the same price
        uint256 sellPrice = bondingCurve.getSellPrice(
            address(token),
            buyAmount
        );

        // They should be equal in a perfect quadratic curve
        assertEq(buyPrice, sellPrice, "Buy and sell prices should match");
    }

    function testBuyTokens() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyPrice(address(token), amount);

        vm.prank(buyer);
        bondingCurve.buy{value: cost}(address(token), amount);

        assertEq(
            bondingCurve.getSupply(address(token)),
            amount,
            "Supply should match bought amount"
        );
        assertEq(
            bondingCurve.getReserve(address(token)),
            cost,
            "Reserve should equal cost"
        );
    }

    function testBuyTokensWithExcessETH() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyPrice(address(token), amount);
        uint256 excess = 1 ether;

        uint256 balanceBefore = buyer.balance;

        vm.prank(buyer);
        bondingCurve.buy{value: cost + excess}(address(token), amount);

        uint256 balanceAfter = buyer.balance;

        // Balance should decrease by cost only (excess refunded)
        assertEq(
            balanceBefore - balanceAfter,
            cost,
            "Only cost should be deducted"
        );
    }

    function testBuyTokensInsufficientPayment() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyPrice(address(token), amount);

        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        bondingCurve.buy{value: cost - 1}(address(token), amount);
    }

    function testSellTokens() public {
        uint256 buyAmount = 100 * 10 ** 18;
        uint256 buyCost = bondingCurve.getBuyPrice(address(token), buyAmount);

        // First buy tokens
        vm.prank(buyer);
        bondingCurve.buy{value: buyCost}(address(token), buyAmount);

        // Then sell them
        uint256 sellPrice = bondingCurve.getSellPrice(
            address(token),
            buyAmount
        );

        uint256 balanceBefore = buyer.balance;

        vm.prank(buyer);
        bondingCurve.sell(address(token), buyAmount);

        uint256 balanceAfter = buyer.balance;

        assertEq(
            balanceAfter - balanceBefore,
            sellPrice,
            "Balance should increase by sell price"
        );
        assertEq(
            bondingCurve.getSupply(address(token)),
            0,
            "Supply should be zero after selling all"
        );
    }

    function testSellTokensMoreThanOwned() public {
        uint256 buyAmount = 100 * 10 ** 18;
        uint256 buyCost = bondingCurve.getBuyPrice(address(token), buyAmount);

        vm.prank(buyer);
        bondingCurve.buy{value: buyCost}(address(token), buyAmount);

        uint256 sellAmount = buyAmount + 1 ether;

        vm.prank(buyer);
        vm.expectRevert("Insufficient supply");
        bondingCurve.sell(address(token), sellAmount);
    }

    function testMultipleBuyers() public {
        address buyer2 = address(0x789);
        vm.deal(buyer2, 100 ether);

        token.mint(buyer2, 1_000_000 * 10 ** 18);

        vm.prank(buyer2);
        token.approve(address(bondingCurve), type(uint256).max);

        uint256 amount = 100 * 10 ** 18;

        // First buyer
        uint256 price1 = bondingCurve.getBuyPrice(address(token), amount);
        vm.prank(buyer);
        bondingCurve.buy{value: price1}(address(token), amount);

        // Second buyer - price should be higher
        uint256 price2 = bondingCurve.getBuyPrice(address(token), amount);

        assertGt(price2, price1, "Price should increase with supply");

        vm.prank(buyer2);
        bondingCurve.buy{value: price2}(address(token), amount);

        assertEq(
            bondingCurve.getSupply(address(token)),
            amount * 2,
            "Supply should be 2x amount"
        );
    }

    function testInsufficientReserveForSell() public {
        uint256 buyAmount = 100 * 10 ** 18;
        uint256 buyCost = bondingCurve.getBuyPrice(address(token), buyAmount);

        vm.prank(buyer);
        bondingCurve.buy{value: buyCost}(address(token), buyAmount);

        // Manually reduce reserve (simulate malicious contract)
        // This should prevent selling
        vm.deal(address(bondingCurve), 0);

        vm.prank(buyer);
        vm.expectRevert("Insufficient reserve");
        bondingCurve.sell(address(token), buyAmount);
    }

    function testEmitBuyEvent() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 cost = bondingCurve.getBuyPrice(address(token), amount);

        vm.prank(buyer);
        vm.expectEmit(true, true, false, true);
        emit BondingCurve.Buy(buyer, address(token), amount, cost);
        bondingCurve.buy{value: cost}(address(token), amount);
    }

    function testEmitSellEvent() public {
        uint256 buyAmount = 100 * 10 ** 18;
        uint256 buyCost = bondingCurve.getBuyPrice(address(token), buyAmount);

        vm.prank(buyer);
        bondingCurve.buy{value: buyCost}(address(token), buyAmount);

        uint256 sellPrice = bondingCurve.getSellPrice(
            address(token),
            buyAmount
        );

        vm.prank(buyer);
        vm.expectEmit(true, true, false, true);
        emit BondingCurve.Sell(buyer, address(token), buyAmount, sellPrice);
        bondingCurve.sell(address(token), buyAmount);
    }

    function testZeroAmountBuy() public {
        vm.prank(buyer);
        vm.expectRevert("Amount must be greater than 0");
        bondingCurve.buy{value: 0}(address(token), 0);
    }

    function testZeroAmountSell() public {
        vm.prank(buyer);
        vm.expectRevert("Amount must be greater than 0");
        bondingCurve.sell(address(token), 0);
    }

    // Receive ETH for testing
    receive() external payable {}
}
