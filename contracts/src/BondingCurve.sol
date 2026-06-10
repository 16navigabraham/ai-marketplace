// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";

/// @title BondingCurve
/// @notice Implements a quadratic bonding curve for agent token pricing
/// @dev Price formula: price = k * supply^2
/// This contract handles buying and selling of agent tokens based on the bonding curve
contract BondingCurve is Ownable, ReentrancyGuard {
    /// @notice Constant multiplier for price calculation (k = 1e18)
    /// @dev Price = K * (newSupply^2 - oldSupply^2) / 2 / 1e18
    uint256 public constant K = 1e18;

    /// @notice Mapping from token address to its tracked supply
    /// @dev This is the supply tracked by the bonding curve, not the ERC-20 total supply
    mapping(address => uint256) public supply;

    /// @notice Mapping from token address to its ETH reserve
    mapping(address => uint256) public reserve;

    /// @notice Emitted when tokens are bought
    /// @param buyer The address of the buyer
    /// @param token The address of the token being bought
    /// @param amount The amount of tokens bought
    /// @param cost The cost in ETH paid for the tokens
    event Buy(address indexed buyer, address indexed token, uint256 amount, uint256 cost);

    /// @notice Emitted when tokens are sold
    /// @param seller The address of the seller
    /// @param token The address of the token being sold
    /// @param amount The amount of tokens sold
    /// @param revenue The amount of ETH received for the tokens
    event Sell(
        address indexed seller,
        address indexed token,
        uint256 amount,
        uint256 revenue
    );

    /// @notice Calculate the price to buy a specific amount of tokens
    /// @param token The address of the token
    /// @param amount The amount of tokens to buy
    /// @return price The price in ETH for the specified amount
    function getBuyPrice(address token, uint256 amount)
        public
        view
        returns (uint256)
    {
        require(amount > 0, "Amount must be greater than 0");

        uint256 currentSupply = supply[token];
        uint256 newSupply = currentSupply + amount;

        // Price = k * (newSupply^2 - currentSupply^2) / 2 / 1e18
        uint256 price = (K * (newSupply * newSupply - currentSupply * currentSupply))
            / 2
            / 1e18;
        return price;
    }

    /// @notice Calculate the price to sell a specific amount of tokens
    /// @param token The address of the token
    /// @param amount The amount of tokens to sell
    /// @return price The price in ETH for the specified amount
    function getSellPrice(address token, uint256 amount)
        public
        view
        returns (uint256)
    {
        require(amount > 0, "Amount must be greater than 0");

        uint256 currentSupply = supply[token];
        require(currentSupply >= amount, "Cannot sell more than supply");

        uint256 newSupply = currentSupply - amount;

        // Price = k * (currentSupply^2 - newSupply^2) / 2 / 1e18
        uint256 price = (K * (currentSupply * currentSupply - newSupply * newSupply))
            / 2
            / 1e18;
        return price;
    }

    /// @notice Buy tokens using ETH
    /// @dev Transfers tokens from caller to this contract and updates reserves
    /// @param token The address of the token to buy
    /// @param amount The amount of tokens to buy
    function buy(address token, uint256 amount) public payable nonReentrant {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        uint256 cost = getBuyPrice(token, amount);
        require(msg.value >= cost, "Insufficient payment");

        // Update supply and reserve
        supply[token] += amount;
        reserve[token] += cost;

        // Transfer tokens from buyer to contract
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        // Refund excess ETH
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }

        emit Buy(msg.sender, token, amount, cost);
    }

    /// @notice Sell tokens for ETH
    /// @dev Transfers tokens from caller to this contract and ETH back to caller
    /// @param token The address of the token to sell
    /// @param amount The amount of tokens to sell
    function sell(address token, uint256 amount) public nonReentrant {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(supply[token] >= amount, "Insufficient supply");

        uint256 revenue = getSellPrice(token, amount);
        require(reserve[token] >= revenue, "Insufficient reserve");

        // Update supply and reserve
        supply[token] -= amount;
        reserve[token] -= revenue;

        // Transfer tokens from seller to contract
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        // Transfer ETH to seller
        (bool success, ) = payable(msg.sender).call{value: revenue}("");
        require(success, "ETH transfer failed");

        emit Sell(msg.sender, token, amount, revenue);
    }

    /// @notice Get the ETH reserve for a token
    /// @param token The address of the token
    /// @return The ETH reserve amount
    function getReserve(address token) public view returns (uint256) {
        return reserve[token];
    }

    /// @notice Get the supply for a token (tracked by the curve)
    /// @param token The address of the token
    /// @return The supply amount tracked by the curve
    function getSupply(address token) public view returns (uint256) {
        return supply[token];
    }

    /// @notice Withdraw stuck tokens (emergency function)
    /// @dev Only owner can call this
    /// @param token The address of the token to withdraw
    /// @param amount The amount to withdraw
    function emergencyWithdraw(address token, uint256 amount) public onlyOwner {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(
            IERC20(token).transfer(msg.sender, amount),
            "Withdrawal failed"
        );
    }
}
