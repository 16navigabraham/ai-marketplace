// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DelegationManager.sol";

contract DelegationManagerTest is Test {
    DelegationManager manager;
    address user = address(0x111);
    address target = address(0xCAFE);
    address otherTarget = address(0xBEEF);
    uint256 constant AGENT_ID = 1;
    uint256 future;

    event DelegationGranted(
        address indexed user,
        uint256 indexed agentId,
        address allowedTarget,
        uint256 spendLimit,
        uint256 expiration
    );
    event DelegationRevoked(address indexed user, uint256 indexed agentId);

    function setUp() public {
        manager = new DelegationManager();
        future = block.timestamp + 1 days;
    }

    function _grant() internal {
        vm.prank(user);
        manager.grantDelegation(AGENT_ID, target, 10 ether, future);
    }

    function testGrantStoresRule() public {
        _grant();

        (
            uint256 spendLimit,
            uint256 spentAmount,
            address allowedTarget,
            uint256 expiration,
            bool active
        ) = manager.delegations(user, AGENT_ID);

        assertEq(spendLimit, 10 ether);
        assertEq(spentAmount, 0);
        assertEq(allowedTarget, target);
        assertEq(expiration, future);
        assertTrue(active);
    }

    function testGrantEmitsEvent() public {
        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit DelegationGranted(user, AGENT_ID, target, 10 ether, future);
        manager.grantDelegation(AGENT_ID, target, 10 ether, future);
    }

    function testGrantPastExpirationReverts() public {
        vm.prank(user);
        vm.expectRevert("Expiration must be in the future");
        manager.grantDelegation(AGENT_ID, target, 10 ether, block.timestamp);
    }

    function testRevokeDeactivates() public {
        _grant();

        vm.prank(user);
        manager.revokeDelegation(AGENT_ID);

        (, , , , bool active) = manager.delegations(user, AGENT_ID);
        assertFalse(active, "Delegation deactivated");
    }

    function testRevokeEmitsEvent() public {
        _grant();

        vm.prank(user);
        vm.expectEmit(true, true, false, false);
        emit DelegationRevoked(user, AGENT_ID);
        manager.revokeDelegation(AGENT_ID);
    }

    function testRevokeWithoutActiveReverts() public {
        vm.prank(user);
        vm.expectRevert("No active delegation");
        manager.revokeDelegation(AGENT_ID);
    }

    function testVerifyAndSpendWithinLimit() public {
        _grant();

        bool ok = manager.verifyAndSpend(user, AGENT_ID, target, 4 ether);
        assertTrue(ok, "Spend within limit succeeds");

        (, uint256 spentAmount, , , ) = manager.delegations(user, AGENT_ID);
        assertEq(spentAmount, 4 ether, "Spent tracked");
    }

    function testVerifyAndSpendAccumulates() public {
        _grant();

        assertTrue(manager.verifyAndSpend(user, AGENT_ID, target, 6 ether));
        assertTrue(manager.verifyAndSpend(user, AGENT_ID, target, 4 ether));

        (, uint256 spentAmount, , , ) = manager.delegations(user, AGENT_ID);
        assertEq(spentAmount, 10 ether, "Spends accumulate");
    }

    function testVerifyAndSpendOverLimitFails() public {
        _grant();

        bool ok = manager.verifyAndSpend(user, AGENT_ID, target, 11 ether);
        assertFalse(ok, "Over limit returns false");

        (, uint256 spentAmount, , , ) = manager.delegations(user, AGENT_ID);
        assertEq(spentAmount, 0, "No spend recorded on failure");
    }

    function testVerifyAndSpendWrongTargetFails() public {
        _grant();
        assertFalse(manager.verifyAndSpend(user, AGENT_ID, otherTarget, 1 ether), "Wrong target fails");
    }

    function testVerifyAndSpendInactiveFails() public {
        _grant();
        vm.prank(user);
        manager.revokeDelegation(AGENT_ID);

        assertFalse(manager.verifyAndSpend(user, AGENT_ID, target, 1 ether), "Inactive fails");
    }

    function testVerifyAndSpendExpiredFails() public {
        _grant();
        vm.warp(future + 1);

        assertFalse(manager.verifyAndSpend(user, AGENT_ID, target, 1 ether), "Expired fails");
    }

    function testVerifyAndSpendNoDelegationFails() public {
        assertFalse(manager.verifyAndSpend(user, AGENT_ID, target, 1 ether), "No delegation fails");
    }
}
