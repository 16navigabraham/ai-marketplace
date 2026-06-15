// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract ReputationScore is Ownable {
    enum ReputationTier { UNVERIFIED, PROVISIONAL, TRUSTED, ELITE }

    struct ReputationMetrics {
        uint256 score; // 0 - 1000
        ReputationTier tier;
        uint256 taskSuccessCount;
        uint256 disputeCount;
        uint256 revocationCount;
    }

    mapping(uint256 => ReputationMetrics) public agentReputations;

    event ReputationUpdated(uint256 indexed agentId, uint256 newScore, ReputationTier tier);

    constructor() Ownable() {}

    function initializeReputation(uint256 agentId) external onlyOwner {
        agentReputations[agentId] = ReputationMetrics({
            score: 500,
            tier: ReputationTier.PROVISIONAL,
            taskSuccessCount: 0,
            disputeCount: 0,
            revocationCount: 0
        });
        emit ReputationUpdated(agentId, 500, ReputationTier.PROVISIONAL);
    }

    function recordTaskCompletion(uint256 agentId, bool success) external onlyOwner {
        ReputationMetrics storage metrics = agentReputations[agentId];
        if (success) {
            metrics.taskSuccessCount++;
            if (metrics.score + 5 <= 1000) {
                metrics.score += 5;
            }
        } else {
            metrics.disputeCount++;
            if (metrics.score >= 20) {
                metrics.score -= 20;
            } else {
                metrics.score = 0;
            }
        }
        _updateTier(agentId);
    }

    function recordRevocation(uint256 agentId) external onlyOwner {
        ReputationMetrics storage metrics = agentReputations[agentId];
        metrics.revocationCount++;
        if (metrics.score >= 50) {
            metrics.score -= 50;
        } else {
            metrics.score = 0;
        }
        _updateTier(agentId);
    }

    function _updateTier(uint256 agentId) internal {
        ReputationMetrics storage metrics = agentReputations[agentId];
        ReputationTier oldTier = metrics.tier;

        if (metrics.score >= 900) {
            metrics.tier = ReputationTier.ELITE;
        } else if (metrics.score >= 700) {
            metrics.tier = ReputationTier.TRUSTED;
        } else if (metrics.score >= 300) {
            metrics.tier = ReputationTier.PROVISIONAL;
        } else {
            metrics.tier = ReputationTier.UNVERIFIED;
        }

        if (oldTier != metrics.tier) {
            emit ReputationUpdated(agentId, metrics.score, metrics.tier);
        }
    }

    function getReputation(uint256 agentId) external view returns (uint256 score, ReputationTier tier) {
        return (agentReputations[agentId].score, agentReputations[agentId].tier);
    }
}
