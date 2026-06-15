// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract DelegationManager is Ownable {
    struct DelegationRule {
        uint256 spendLimit;
        uint256 spentAmount;
        address allowedTarget;
        uint256 expiration;
        bool active;
    }

    // user => agentId => rule
    mapping(address => mapping(uint256 => DelegationRule)) public delegations;

    event DelegationGranted(
        address indexed user,
        uint256 indexed agentId,
        address allowedTarget,
        uint256 spendLimit,
        uint256 expiration
    );
    event DelegationRevoked(address indexed user, uint256 indexed agentId);

    function grantDelegation(
        uint256 agentId,
        address allowedTarget,
        uint256 spendLimit,
        uint256 expiration
    ) external {
        require(expiration > block.timestamp, "Expiration must be in the future");
        delegations[msg.sender][agentId] = DelegationRule({
            spendLimit: spendLimit,
            spentAmount: 0,
            allowedTarget: allowedTarget,
            expiration: expiration,
            active: true
        });

        emit DelegationGranted(msg.sender, agentId, allowedTarget, spendLimit, expiration);
    }

    function revokeDelegation(uint256 agentId) external {
        require(delegations[msg.sender][agentId].active, "No active delegation");
        delegations[msg.sender][agentId].active = false;

        emit DelegationRevoked(msg.sender, agentId);
    }

    function verifyAndSpend(
        address user,
        uint256 agentId,
        address target,
        uint256 amount
    ) external returns (bool) {
        DelegationRule storage rule = delegations[user][agentId];
        if (!rule.active || block.timestamp > rule.expiration || target != rule.allowedTarget) {
            return false;
        }
        if (rule.spentAmount + amount > rule.spendLimit) {
            return false;
        }
        rule.spentAmount += amount;
        return true;
    }
}
