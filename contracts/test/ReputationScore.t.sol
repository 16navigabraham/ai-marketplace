// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ReputationScore.sol";

contract ReputationScoreTest is Test {
    ReputationScore reputation;
    address stranger = address(0x111);
    uint256 constant AGENT_ID = 1;

    event ReputationUpdated(uint256 indexed agentId, uint256 newScore, ReputationScore.ReputationTier tier);

    function setUp() public {
        reputation = new ReputationScore();
    }

    function testInitializeSetsProvisional() public {
        reputation.initializeReputation(AGENT_ID);

        (uint256 score, ReputationScore.ReputationTier tier) = reputation.getReputation(AGENT_ID);
        assertEq(score, 500, "Starts at 500");
        assertEq(uint256(tier), uint256(ReputationScore.ReputationTier.PROVISIONAL), "Starts PROVISIONAL");
    }

    function testInitializeEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit ReputationUpdated(AGENT_ID, 500, ReputationScore.ReputationTier.PROVISIONAL);
        reputation.initializeReputation(AGENT_ID);
    }

    function testInitializeOnlyOwner() public {
        vm.prank(stranger);
        vm.expectRevert("Ownable: caller is not the owner");
        reputation.initializeReputation(AGENT_ID);
    }

    function testSuccessRaisesScore() public {
        reputation.initializeReputation(AGENT_ID);
        reputation.recordTaskCompletion(AGENT_ID, true);

        (uint256 score, ) = reputation.getReputation(AGENT_ID);
        assertEq(score, 505, "Success adds 5");
    }

    function testUnsuccessfulTaskLowersScore() public {
        reputation.initializeReputation(AGENT_ID);
        reputation.recordTaskCompletion(AGENT_ID, false);

        (uint256 score, ) = reputation.getReputation(AGENT_ID);
        assertEq(score, 480, "Failure subtracts 20");
    }

    function testTaskCompletionTracksCounts() public {
        reputation.initializeReputation(AGENT_ID);
        reputation.recordTaskCompletion(AGENT_ID, true);
        reputation.recordTaskCompletion(AGENT_ID, true);
        reputation.recordTaskCompletion(AGENT_ID, false);

        (, , uint256 taskSuccessCount, uint256 disputeCount, ) = reputation.agentReputations(AGENT_ID);
        assertEq(taskSuccessCount, 2, "Two successes tracked");
        assertEq(disputeCount, 1, "One dispute tracked");
    }

    function testScoreCapsAt1000() public {
        reputation.initializeReputation(AGENT_ID);
        // 500 -> climb past 1000; each success +5, only applied when <= 1000.
        for (uint256 i = 0; i < 120; i++) {
            reputation.recordTaskCompletion(AGENT_ID, true);
        }
        (uint256 score, ) = reputation.getReputation(AGENT_ID);
        assertLe(score, 1000, "Score never exceeds 1000");
    }

    function testScoreFloorsAtZero() public {
        reputation.initializeReputation(AGENT_ID);
        for (uint256 i = 0; i < 60; i++) {
            reputation.recordTaskCompletion(AGENT_ID, false);
        }
        (uint256 score, ) = reputation.getReputation(AGENT_ID);
        assertEq(score, 0, "Score floors at 0");
    }

    function testPromotionToElite() public {
        reputation.initializeReputation(AGENT_ID);
        // 500 -> 900 needs 80 successes (+5 each).
        for (uint256 i = 0; i < 80; i++) {
            reputation.recordTaskCompletion(AGENT_ID, true);
        }
        (uint256 score, ReputationScore.ReputationTier tier) = reputation.getReputation(AGENT_ID);
        assertEq(score, 900);
        assertEq(uint256(tier), uint256(ReputationScore.ReputationTier.ELITE), "900 => ELITE");
    }

    function testPromotionToTrusted() public {
        reputation.initializeReputation(AGENT_ID);
        // 500 -> 700 needs 40 successes.
        for (uint256 i = 0; i < 40; i++) {
            reputation.recordTaskCompletion(AGENT_ID, true);
        }
        (uint256 score, ReputationScore.ReputationTier tier) = reputation.getReputation(AGENT_ID);
        assertEq(score, 700);
        assertEq(uint256(tier), uint256(ReputationScore.ReputationTier.TRUSTED), "700 => TRUSTED");
    }

    function testDemotionToUnverified() public {
        reputation.initializeReputation(AGENT_ID);
        // 500 -> below 300 needs 11 failures (-20 each => 280).
        for (uint256 i = 0; i < 11; i++) {
            reputation.recordTaskCompletion(AGENT_ID, false);
        }
        (uint256 score, ReputationScore.ReputationTier tier) = reputation.getReputation(AGENT_ID);
        assertEq(score, 280);
        assertEq(uint256(tier), uint256(ReputationScore.ReputationTier.UNVERIFIED), "<300 => UNVERIFIED");
    }

    function testRecordTaskOnlyOwner() public {
        reputation.initializeReputation(AGENT_ID);
        vm.prank(stranger);
        vm.expectRevert("Ownable: caller is not the owner");
        reputation.recordTaskCompletion(AGENT_ID, true);
    }

    function testRevocationLowersScore() public {
        reputation.initializeReputation(AGENT_ID);
        reputation.recordRevocation(AGENT_ID);

        (uint256 score, ) = reputation.getReputation(AGENT_ID);
        assertEq(score, 450, "Revocation subtracts 50");
        (, , , , uint256 revocationCount) = reputation.agentReputations(AGENT_ID);
        assertEq(revocationCount, 1, "Revocation counted");
    }

    function testRevocationFloorsAtZero() public {
        reputation.initializeReputation(AGENT_ID);
        // Drive score below 50 first, then revoke.
        for (uint256 i = 0; i < 24; i++) {
            reputation.recordTaskCompletion(AGENT_ID, false); // 500 -> 20
        }
        reputation.recordRevocation(AGENT_ID); // 20 < 50 => 0
        (uint256 score, ) = reputation.getReputation(AGENT_ID);
        assertEq(score, 0, "Revocation floors at 0");
    }

    function testRevocationOnlyOwner() public {
        reputation.initializeReputation(AGENT_ID);
        vm.prank(stranger);
        vm.expectRevert("Ownable: caller is not the owner");
        reputation.recordRevocation(AGENT_ID);
    }
}
