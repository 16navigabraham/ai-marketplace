// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title AgentToken
/// @notice ERC-20 token contract for individual AI agents
/// @dev Each agent has its own ERC-20 token for ownership and trading
contract AgentToken is ERC20, Ownable {
    /// @notice The address of the associated Agent NFT contract
    address public agent;

    /// @notice The initial supply of tokens (1 million tokens with 18 decimals)
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    /// @notice Initialize the AgentToken contract
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param _agent The address of the associated Agent NFT contract
    constructor(
        string memory name,
        string memory symbol,
        address _agent
    ) ERC20(name, symbol) {
        agent = _agent;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /// @notice Mint new tokens
    /// @dev Only the owner can mint tokens
    /// @param to The address to mint tokens to
    /// @param amount The amount of tokens to mint
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
    }

    /// @notice Burn tokens from the caller's balance
    /// @param amount The amount of tokens to burn
    function burn(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        _burn(msg.sender, amount);
    }

    /// @notice Burn tokens from another account using allowance
    /// @param account The account to burn tokens from
    /// @param amount The amount of tokens to burn
    function burnFrom(address account, uint256 amount) public {
        require(account != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");

        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "ERC20: insufficient allowance");

        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }

    /// @notice Increase the allowance granted to a spender
    /// @param spender The address to increase allowance for
    /// @param addedValue The amount to add to the allowance
    /// @return true if the operation was successful
    function increaseAllowance(address spender, uint256 addedValue)
        public
        override
        returns (bool)
    {
        require(spender != address(0), "Cannot approve zero address");
        require(addedValue > 0, "Added value must be greater than 0");
        return super.increaseAllowance(spender, addedValue);
    }

    /// @notice Decrease the allowance granted to a spender
    /// @param spender The address to decrease allowance for
    /// @param subtractedValue The amount to subtract from the allowance
    /// @return true if the operation was successful
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        override
        returns (bool)
    {
        require(spender != address(0), "Cannot revoke zero address");
        return super.decreaseAllowance(spender, subtractedValue);
    }
}
