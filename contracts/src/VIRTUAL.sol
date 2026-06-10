// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title VIRTUAL
/// @notice Main governance token for the AI Agents Marketplace
/// @dev ERC-20 token with minting and burning capabilities
contract VIRTUAL is ERC20, ERC20Burnable, Ownable {
    /// @notice Initial total supply: 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10 ** 18;

    /// @notice Initialize the VIRTUAL governance token
    constructor() ERC20("Virtual Protocol", "VIRTUAL") {
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

    /// @notice Increase allowance with validation
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

    /// @notice Decrease allowance with validation
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

    /// @notice Burn tokens with validation
    /// @param amount The amount of tokens to burn
    function burn(uint256 amount) public override {
        require(amount > 0, "Amount must be greater than 0");
        super.burn(amount);
    }

    /// @notice Burn tokens from another account
    /// @param account The account to burn tokens from
    /// @param amount The amount of tokens to burn
    function burnFrom(address account, uint256 amount) public override {
        require(amount > 0, "Amount must be greater than 0");
        super.burnFrom(account, amount);
    }
}
