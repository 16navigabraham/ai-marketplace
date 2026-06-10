// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IMarketplace
/// @notice Interface for the agent marketplace contract
interface IMarketplace {
    /// @notice Struct for a sell order
    struct Order {
        uint256 orderId;
        address seller;
        address agentToken;
        uint256 amount;
        uint256 pricePerToken;
        uint256 createdAt;
        bool active;
    }

    /// @notice Create a new sell order for agent tokens
    /// @param agentToken The address of the agent token
    /// @param amount The amount of tokens to sell
    /// @param pricePerToken The price per token in ETH
    /// @return orderId The ID of the created order
    function createOrder(
        address agentToken,
        uint256 amount,
        uint256 pricePerToken
    ) external returns (uint256);

    /// @notice Cancel an existing sell order
    /// @param orderId The ID of the order to cancel
    function cancelOrder(uint256 orderId) external;

    /// @notice Buy tokens from an order
    /// @param orderId The ID of the order
    /// @param amount The amount of tokens to buy
    function buyFromOrder(uint256 orderId, uint256 amount) external payable;

    /// @notice Get order details
    /// @param orderId The ID of the order
    /// @return order The order details
    function getOrder(uint256 orderId) external view returns (Order memory);

    /// @notice Get all active orders for a token
    /// @param agentToken The address of the agent token
    /// @return orderIds The IDs of active orders
    function getTokenOrders(address agentToken)
        external
        view
        returns (uint256[] memory);

    /// @notice Get the fee percentage (basis points)
    /// @return fee The fee in basis points (e.g., 250 = 2.5%)
    function getFeePercentage() external view returns (uint256);

    /// @notice Set the fee percentage (only owner)
    /// @param _feePercentage The new fee in basis points
    function setFeePercentage(uint256 _feePercentage) external;

    /// @notice Withdraw collected fees (only owner)
    function withdrawFees() external;

    /// @notice Event emitted when an order is created
    event OrderCreated(
        uint256 indexed orderId,
        address indexed seller,
        address indexed agentToken,
        uint256 amount,
        uint256 pricePerToken
    );

    /// @notice Event emitted when an order is cancelled
    event OrderCancelled(uint256 indexed orderId);

    /// @notice Event emitted when tokens are bought
    event TokensBought(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );

    /// @notice Event emitted when fees are collected
    event FeesCollected(uint256 amount);
}
