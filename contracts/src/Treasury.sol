// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    uint256 public totalProtocolFeesCollected;

    event BountyPaid(address indexed contributor, uint256 amount, string reason);
    event FundsReceived(address indexed sender, uint256 amount);

    constructor() Ownable() {}

    // Receive ETH deposits (e.g. from staking protocol fees)
    receive() external payable {
        totalProtocolFeesCollected += msg.value;
        emit FundsReceived(msg.sender, msg.value);
    }

    function payBugBounty(
        address contributor,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient treasury balance");

        (bool success, ) = contributor.call{value: amount}("");
        require(success, "Bounty payout transfer failed");

        emit BountyPaid(contributor, amount, reason);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient treasury balance");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal transfer failed");
    }
}
