// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IMarketplace.sol";

/// @title Marketplace
/// @notice Marketplace for trading agent tokens with order management
/// @dev Implements buy/sell orders with configurable fees
contract Marketplace is IMarketplace, Ownable, ReentrancyGuard {
    /// @notice Counter for order IDs
    uint256 private _orderCounter;

    /// @notice Mapping from order ID to order details
    mapping(uint256 => Order) public orders;

    /// @notice Mapping from token address to array of order IDs
    mapping(address => uint256[]) public tokenOrders;

    /// @notice Accumulated fees
    uint256 public accumulatedFees;

    /// @notice Fee percentage in basis points (e.g., 250 = 2.5%)
    /// @dev Default: 2.5% fee
    uint256 public feePercentage = 250;

    /// @notice Maximum fee percentage: 50% (5000 basis points)
    uint256 public constant MAX_FEE_PERCENTAGE = 5000;

    /// @notice Initialize the Marketplace contract
    constructor() {
        _orderCounter = 1;
    }

    /// @notice Create a new sell order for agent tokens
    /// @param agentToken The address of the agent token
    /// @param amount The amount of tokens to sell
    /// @param pricePerToken The price per token in ETH (in wei)
    /// @return orderId The ID of the created order
    function createOrder(
        address agentToken,
        uint256 amount,
        uint256 pricePerToken
    ) public returns (uint256) {
        require(agentToken != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerToken > 0, "Price per token must be greater than 0");

        // Check allowance
        IERC20 token = IERC20(agentToken);
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Transfer tokens from seller to marketplace
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Create order
        uint256 orderId = _orderCounter;
        _orderCounter++;

        orders[orderId] = Order({
            orderId: orderId,
            seller: msg.sender,
            agentToken: agentToken,
            amount: amount,
            pricePerToken: pricePerToken,
            createdAt: block.timestamp,
            active: true
        });

        // Add to token orders
        tokenOrders[agentToken].push(orderId);

        emit OrderCreated(orderId, msg.sender, agentToken, amount, pricePerToken);

        return orderId;
    }

    /// @notice Cancel an existing sell order
    /// @param orderId The ID of the order to cancel
    function cancelOrder(uint256 orderId) public nonReentrant {
        Order storage order = orders[orderId];

        require(order.active, "Order is not active");
        require(order.seller == msg.sender, "Only seller can cancel order");

        // Mark as inactive
        order.active = false;

        // Return tokens to seller
        IERC20 token = IERC20(order.agentToken);
        require(
            token.transfer(msg.sender, order.amount),
            "Token transfer failed"
        );

        emit OrderCancelled(orderId);
    }

    /// @notice Buy tokens from an order
    /// @param orderId The ID of the order
    /// @param amount The amount of tokens to buy
    function buyFromOrder(uint256 orderId, uint256 amount)
        public
        payable
        nonReentrant
    {
        Order storage order = orders[orderId];

        require(order.active, "Order is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= order.amount, "Amount exceeds available");
        require(order.seller != msg.sender, "Cannot buy from yourself");

        // Calculate price. `pricePerToken` is the price of one whole token (1e18
        // base units), so normalize by the token's 18 decimals to avoid an
        // astronomically large total when `amount` is denominated in wei.
        uint256 totalPrice = (amount * order.pricePerToken) / 1e18;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Calculate fee
        uint256 fee = (totalPrice * feePercentage) / 10000;
        uint256 sellerProceeds = totalPrice - fee;

        // Update order
        order.amount -= amount;
        if (order.amount == 0) {
            order.active = false;
        }

        // Accumulate fees
        accumulatedFees += fee;

        // Transfer tokens to buyer
        IERC20 token = IERC20(order.agentToken);
        require(
            token.transfer(msg.sender, amount),
            "Token transfer failed"
        );

        // Transfer proceeds to seller
        (bool success, ) = payable(order.seller).call{value: sellerProceeds}(
            ""
        );
        require(success, "Transfer to seller failed");

        // Refund excess ETH
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - totalPrice
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit TokensBought(orderId, msg.sender, amount, totalPrice);
    }

    /// @notice Get order details
    /// @param orderId The ID of the order
    /// @return order The order details
    function getOrder(uint256 orderId) public view returns (Order memory) {
        return orders[orderId];
    }

    /// @notice Get all active orders for a token
    /// @param agentToken The address of the agent token
    /// @return orderIds The IDs of active orders (including inactive)
    function getTokenOrders(address agentToken)
        public
        view
        returns (uint256[] memory)
    {
        return tokenOrders[agentToken];
    }

    /// @notice Get the count of orders for a token
    /// @param agentToken The address of the agent token
    /// @return The count of orders
    function getTokenOrderCount(address agentToken)
        public
        view
        returns (uint256)
    {
        return tokenOrders[agentToken].length;
    }

    /// @notice Get active orders for a token (filtered)
    /// @param agentToken The address of the agent token
    /// @return orderIds The IDs of active orders
    function getActiveTokenOrders(address agentToken)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory allOrders = tokenOrders[agentToken];
        uint256 activeCount = 0;

        // Count active orders
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (orders[allOrders[i]].active) {
                activeCount++;
            }
        }

        // Create array of active orders
        uint256[] memory activeOrders = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allOrders.length; i++) {
            if (orders[allOrders[i]].active) {
                activeOrders[index] = allOrders[i];
                index++;
            }
        }

        return activeOrders;
    }

    /// @notice Get the fee percentage
    /// @return The fee in basis points (e.g., 250 = 2.5%)
    function getFeePercentage() public view returns (uint256) {
        return feePercentage;
    }

    /// @notice Set the fee percentage (only owner)
    /// @param _feePercentage The new fee in basis points
    function setFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(
            _feePercentage <= MAX_FEE_PERCENTAGE,
            "Fee percentage exceeds maximum"
        );
        feePercentage = _feePercentage;
    }

    /// @notice Withdraw collected fees (only owner)
    function withdrawFees() public onlyOwner nonReentrant {
        uint256 feesToWithdraw = accumulatedFees;
        require(feesToWithdraw > 0, "No fees to withdraw");

        accumulatedFees = 0;

        (bool success, ) = payable(msg.sender).call{value: feesToWithdraw}("");
        require(success, "Withdrawal failed");

        emit FeesCollected(feesToWithdraw);
    }

    /// @notice Get accumulated fees balance
    /// @return The amount of accumulated fees
    function getAccumulatedFees() public view returns (uint256) {
        return accumulatedFees;
    }

    /// @notice Get total number of orders
    /// @return The total order count
    function getTotalOrders() public view returns (uint256) {
        return _orderCounter - 1;
    }

    /// @notice Emergency withdraw tokens (only owner)
    /// @param token The address of the token
    /// @param amount The amount to withdraw
    function emergencyWithdrawToken(address token, uint256 amount)
        public
        onlyOwner
    {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        require(
            IERC20(token).transfer(msg.sender, amount),
            "Withdrawal failed"
        );
    }
}
