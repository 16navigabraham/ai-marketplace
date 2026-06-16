// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TrustStaking.sol";

contract TrustStakingTest is Test {
    TrustStaking staking;
    address treasury = address(0xBEEF);
    address alice = address(0x111);
    address bob = address(0x222);
    uint256 constant AGENT_ID = 1;

    // Local copies for vm.expectEmit.
    event Staked(address indexed user, uint256 indexed agentId, uint256 amount, uint256 fee);
    event Unstaked(address indexed user, uint256 indexed agentId, uint256 amount);
    event Slashed(uint256 indexed agentId, uint256 slashAmount);

    function setUp() public {
        staking = new TrustStaking(treasury);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function testConstructorRejectsZeroTreasury() public {
        vm.expectRevert("Invalid treasury address");
        new TrustStaking(address(0));
    }

    function testStakeRecordsNetOfFee() public {
        uint256 sent = 1 ether;
        uint256 fee = sent / 100; // 1%
        uint256 net = sent - fee;

        vm.prank(alice);
        staking.stake{value: sent}(AGENT_ID);

        (uint256 amount, ) = staking.stakes(AGENT_ID, alice);
        assertEq(amount, net, "Stake recorded net of fee");
        assertEq(staking.totalStaked(AGENT_ID), net, "Total staked net of fee");
    }

    function testStakeRoutesFeeToTreasury() public {
        uint256 sent = 1 ether;
        uint256 fee = sent / 100;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(alice);
        staking.stake{value: sent}(AGENT_ID);

        assertEq(treasury.balance - treasuryBefore, fee, "Treasury receives 1% fee");
    }

    function testStakeEmitsEvent() public {
        uint256 sent = 1 ether;
        uint256 fee = sent / 100;

        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit Staked(alice, AGENT_ID, sent - fee, fee);
        staking.stake{value: sent}(AGENT_ID);
    }

    function testStakeZeroReverts() public {
        vm.prank(alice);
        vm.expectRevert("Cannot stake 0");
        staking.stake{value: 0}(AGENT_ID);
    }

    function testMultipleStakesAccumulate() public {
        vm.prank(alice);
        staking.stake{value: 1 ether}(AGENT_ID);
        vm.prank(alice);
        staking.stake{value: 2 ether}(AGENT_ID);

        uint256 expected = (1 ether - 1 ether / 100) + (2 ether - 2 ether / 100);
        (uint256 amount, ) = staking.stakes(AGENT_ID, alice);
        assertEq(amount, expected, "Stakes accumulate per user");
    }

    function testStakesTrackedPerUser() public {
        vm.prank(alice);
        staking.stake{value: 1 ether}(AGENT_ID);
        vm.prank(bob);
        staking.stake{value: 3 ether}(AGENT_ID);

        (uint256 aliceAmt, ) = staking.stakes(AGENT_ID, alice);
        (uint256 bobAmt, ) = staking.stakes(AGENT_ID, bob);
        assertEq(aliceAmt, 1 ether - 1 ether / 100);
        assertEq(bobAmt, 3 ether - 3 ether / 100);
        assertEq(staking.totalStaked(AGENT_ID), aliceAmt + bobAmt);
    }

    function testUnstakeReturnsFunds() public {
        vm.prank(alice);
        staking.stake{value: 1 ether}(AGENT_ID);
        (uint256 staked, ) = staking.stakes(AGENT_ID, alice);

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        staking.unstake(AGENT_ID, staked);

        assertEq(alice.balance - balanceBefore, staked, "Funds returned on unstake");
        (uint256 remaining, ) = staking.stakes(AGENT_ID, alice);
        assertEq(remaining, 0, "Stake cleared");
        assertEq(staking.totalStaked(AGENT_ID), 0, "Total cleared");
    }

    function testPartialUnstake() public {
        vm.prank(alice);
        staking.stake{value: 2 ether}(AGENT_ID);
        (uint256 staked, ) = staking.stakes(AGENT_ID, alice);

        uint256 half = staked / 2;
        vm.prank(alice);
        staking.unstake(AGENT_ID, half);

        (uint256 remaining, ) = staking.stakes(AGENT_ID, alice);
        assertEq(remaining, staked - half, "Partial unstake leaves remainder");
    }

    function testUnstakeEmitsEvent() public {
        vm.prank(alice);
        staking.stake{value: 1 ether}(AGENT_ID);
        (uint256 staked, ) = staking.stakes(AGENT_ID, alice);

        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit Unstaked(alice, AGENT_ID, staked);
        staking.unstake(AGENT_ID, staked);
    }

    function testUnstakeMoreThanStakedReverts() public {
        vm.prank(alice);
        staking.stake{value: 1 ether}(AGENT_ID);

        vm.prank(alice);
        vm.expectRevert("Insufficient staked balance");
        staking.unstake(AGENT_ID, 100 ether);
    }

    function testSlashSendsToTreasury() public {
        vm.prank(alice);
        staking.stake{value: 10 ether}(AGENT_ID);
        uint256 total = staking.totalStaked(AGENT_ID);
        uint256 treasuryBefore = treasury.balance;

        staking.slash(AGENT_ID, 50); // slash 50%

        uint256 slashAmount = (total * 50) / 100;
        assertEq(treasury.balance - treasuryBefore, slashAmount, "Slashed funds to treasury");
        assertEq(staking.totalStaked(AGENT_ID), total - slashAmount, "Total reduced by slash");
    }

    function testSlashEmitsEvent() public {
        vm.prank(alice);
        staking.stake{value: 10 ether}(AGENT_ID);
        uint256 total = staking.totalStaked(AGENT_ID);

        vm.expectEmit(true, false, false, true);
        emit Slashed(AGENT_ID, (total * 50) / 100);
        staking.slash(AGENT_ID, 50);
    }

    function testSlashOnlyOwner() public {
        vm.prank(alice);
        staking.stake{value: 1 ether}(AGENT_ID);

        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        staking.slash(AGENT_ID, 50);
    }

    function testSlashPercentageTooHighReverts() public {
        vm.expectRevert("Percentage must be 0-100");
        staking.slash(AGENT_ID, 101);
    }

    function testSlashFullStake() public {
        vm.prank(alice);
        staking.stake{value: 5 ether}(AGENT_ID);
        uint256 total = staking.totalStaked(AGENT_ID);
        uint256 treasuryBefore = treasury.balance;

        staking.slash(AGENT_ID, 100);

        assertEq(staking.totalStaked(AGENT_ID), 0, "Full slash empties pool");
        assertEq(treasury.balance - treasuryBefore, total, "All staked funds slashed");
    }

    // Allow this test contract to receive ETH on unstake.
    receive() external payable {}
}
