// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract TrustStaking is Ownable {
    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    // agentId => total staked
    mapping(uint256 => uint256) public totalStaked;
    // agentId => user => stake info
    mapping(uint256 => mapping(address => StakeInfo)) public stakes;

    address public treasury;

    event Staked(address indexed user, uint256 indexed agentId, uint256 amount, uint256 fee);
    event Unstaked(address indexed user, uint256 indexed agentId, uint256 amount);
    event Slashed(uint256 indexed agentId, uint256 slashAmount);

    constructor(address _treasury) Ownable() {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function stake(uint256 agentId) external payable {
        require(msg.value > 0, "Cannot stake 0");

        uint256 fee = msg.value / 100; // 1% fee on staking actions
        uint256 stakeAmount = msg.value - fee;

        // Route 1% protocol fee directly to treasury
        if (fee > 0) {
            (bool success, ) = treasury.call{value: fee}("");
            require(success, "Fee routing to treasury failed");
        }

        stakes[agentId][msg.sender].amount += stakeAmount;
        totalStaked[agentId] += stakeAmount;

        emit Staked(msg.sender, agentId, stakeAmount, fee);
    }

    function unstake(uint256 agentId, uint256 amount) external {
        StakeInfo storage userStake = stakes[agentId][msg.sender];
        require(userStake.amount >= amount, "Insufficient staked balance");

        userStake.amount -= amount;
        totalStaked[agentId] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal transfer failed");

        emit Unstaked(msg.sender, agentId, amount);
    }

    function slash(uint256 agentId, uint256 percentage) external onlyOwner {
        require(percentage <= 100, "Percentage must be 0-100");
        uint256 currentStaked = totalStaked[agentId];
        uint256 slashAmount = (currentStaked * percentage) / 100;

        totalStaked[agentId] -= slashAmount;

        // Send slashed amount to treasury
        if (slashAmount > 0) {
            (bool success, ) = treasury.call{value: slashAmount}("");
            require(success, "Slashed funds transfer failed");
        }

        emit Slashed(agentId, slashAmount);
    }
}
