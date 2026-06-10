// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";

contract BondingCurve is Ownable, ReentrancyGuard {
    // Price = k * supply^2 (quadratic bonding curve)
    uint256 public constant K = 1e18; // Constant multiplier

    mapping(address => uint256) public supply; // tokenAddress -> totalSupply
    mapping(address => uint256) public reserve; // tokenAddress -> ETH reserve

    event Buy(address indexed buyer, address indexed token, uint256 amount, uint256 cost);
    event Sell(address indexed seller, address indexed token, uint256 amount, uint256 revenue);

    function getBuyPrice(address token, uint256 amount) public view returns (uint256) {
        uint256 currentSupply = supply[token];
        uint256 newSupply = currentSupply + amount;

        uint256 price = (K * (newSupply * newSupply - currentSupply * currentSupply)) / 2 / 1e18;
        return price;
    }

    function getSellPrice(address token, uint256 amount) public view returns (uint256) {
        uint256 currentSupply = supply[token];
        require(currentSupply >= amount, "Cannot sell more than supply");

        uint256 newSupply = currentSupply - amount;
        uint256 price = (K * (currentSupply * currentSupply - newSupply * newSupply)) / 2 / 1e18;
        return price;
    }

    function buy(address token, uint256 amount) public payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        uint256 cost = getBuyPrice(token, amount);
        require(msg.value >= cost, "Insufficient payment");

        supply[token] += amount;
        reserve[token] += msg.value;

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }

        emit Buy(msg.sender, token, amount, cost);
    }

    function sell(address token, uint256 amount) public nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(supply[token] >= amount, "Insufficient supply");

        uint256 revenue = getSellPrice(token, amount);
        require(reserve[token] >= revenue, "Insufficient reserve");

        supply[token] -= amount;
        reserve[token] -= revenue;

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        (bool success, ) = payable(msg.sender).call{value: revenue}("");
        require(success, "Transfer failed");

        emit Sell(msg.sender, token, amount, revenue);
    }

    function getReserve(address token) public view returns (uint256) {
        return reserve[token];
    }

    function getSupply(address token) public view returns (uint256) {
        return supply[token];
    }
}
