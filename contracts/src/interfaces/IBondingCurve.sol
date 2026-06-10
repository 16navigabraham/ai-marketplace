// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IBondingCurve
/// @notice Interface for the bonding curve contract
interface IBondingCurve {
    /// @notice Get the price to buy tokens (in ETH)
    /// @param token The address of the token
    /// @param amount The amount of tokens to buy
    /// @return price The price in ETH
    function getBuyPrice(address token, uint256 amount)
        external
        view
        returns (uint256);

    /// @notice Get the price to sell tokens (in ETH)
    /// @param token The address of the token
    /// @param amount The amount of tokens to sell
    /// @return price The price in ETH
    function getSellPrice(address token, uint256 amount)
        external
        view
        returns (uint256);

    /// @notice Buy tokens using ETH
    /// @param token The address of the token
    /// @param amount The amount of tokens to buy
    function buy(address token, uint256 amount) external payable;

    /// @notice Sell tokens for ETH
    /// @param token The address of the token
    /// @param amount The amount of tokens to sell
    function sell(address token, uint256 amount) external;

    /// @notice Get the ETH reserve for a token
    /// @param token The address of the token
    /// @return reserve The ETH reserve amount
    function getReserve(address token) external view returns (uint256);

    /// @notice Get the total supply tracked by the curve
    /// @param token The address of the token
    /// @return supply The total supply
    function getSupply(address token) external view returns (uint256);

    /// @notice Event emitted when tokens are bought
    event Buy(
        address indexed buyer,
        address indexed token,
        uint256 amount,
        uint256 cost
    );

    /// @notice Event emitted when tokens are sold
    event Sell(
        address indexed seller,
        address indexed token,
        uint256 amount,
        uint256 revenue
    );
}
