// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";

contract AgentRegistryTest is Test {
    AgentRegistry registry;
    address operator = address(0x111);
    address stranger = address(0x222);

    event AgentRegistered(uint256 indexed agentId, address indexed operator, string name);
    event StatusUpdated(uint256 indexed agentId, AgentRegistry.LifecycleStatus status);
    event ProfileLocked(uint256 indexed agentId);

    function setUp() public {
        registry = new AgentRegistry();
    }

    function _register(address who) internal returns (uint256) {
        vm.prank(who);
        return registry.registerAgent(
            "Scout",
            "A research agent",
            "swap,transfer",
            1 ether,
            "uniswap,aave"
        );
    }

    function testRegisterMintsNftToOperator() public {
        uint256 agentId = _register(operator);

        assertEq(agentId, 1, "First id is 1");
        assertEq(registry.ownerOf(agentId), operator, "Operator owns the NFT");
    }

    function testRegisterSetsProfileDefaults() public {
        uint256 agentId = _register(operator);

        (
            string memory name,
            string memory description,
            AgentRegistry.LifecycleStatus status,
            uint256 reputationScore,
            uint256 registrationTimestamp
        ) = registry.agentProfiles(agentId);

        assertEq(name, "Scout");
        assertEq(description, "A research agent");
        assertEq(uint256(status), uint256(AgentRegistry.LifecycleStatus.PENDING), "Starts PENDING");
        assertEq(reputationScore, 500, "Default reputation 500");
        assertEq(registrationTimestamp, block.timestamp, "Timestamp recorded");
    }

    function testRegisterSetsCharacterCard() public {
        uint256 agentId = _register(operator);

        (
            string memory allowedActions,
            uint256 spendingLimit,
            string memory targetProtocols,
            bool isImmutable
        ) = registry.characterCards(agentId);

        assertEq(allowedActions, "swap,transfer");
        assertEq(spendingLimit, 1 ether);
        assertEq(targetProtocols, "uniswap,aave");
        assertFalse(isImmutable, "Card mutable by default");
    }

    function testRegisterEmitsEvent() public {
        vm.prank(operator);
        vm.expectEmit(true, true, false, true);
        emit AgentRegistered(1, operator, "Scout");
        registry.registerAgent("Scout", "desc", "swap", 1 ether, "uniswap");
    }

    function testIncrementingIds() public {
        uint256 first = _register(operator);
        uint256 second = _register(stranger);
        assertEq(first, 1);
        assertEq(second, 2, "Ids increment");
    }

    function testOwnerCanSetStatus() public {
        uint256 agentId = _register(operator);

        vm.prank(operator);
        registry.setLifecycleStatus(agentId, AgentRegistry.LifecycleStatus.ACTIVE);

        (, , AgentRegistry.LifecycleStatus status, , ) = registry.agentProfiles(agentId);
        assertEq(uint256(status), uint256(AgentRegistry.LifecycleStatus.ACTIVE));
    }

    function testContractOwnerCanSetStatus() public {
        uint256 agentId = _register(operator);

        // This test contract is the registry owner.
        registry.setLifecycleStatus(agentId, AgentRegistry.LifecycleStatus.SUSPENDED);

        (, , AgentRegistry.LifecycleStatus status, , ) = registry.agentProfiles(agentId);
        assertEq(uint256(status), uint256(AgentRegistry.LifecycleStatus.SUSPENDED));
    }

    function testSetStatusEmitsEvent() public {
        uint256 agentId = _register(operator);

        vm.prank(operator);
        vm.expectEmit(true, false, false, true);
        emit StatusUpdated(agentId, AgentRegistry.LifecycleStatus.ACTIVATING);
        registry.setLifecycleStatus(agentId, AgentRegistry.LifecycleStatus.ACTIVATING);
    }

    function testSetStatusUnauthorizedReverts() public {
        uint256 agentId = _register(operator);

        vm.prank(stranger);
        vm.expectRevert("Not authorized");
        registry.setLifecycleStatus(agentId, AgentRegistry.LifecycleStatus.ACTIVE);
    }

    function testLockProfile() public {
        uint256 agentId = _register(operator);

        vm.prank(operator);
        registry.lockProfile(agentId);

        (, , , bool isImmutable) = registry.characterCards(agentId);
        assertTrue(isImmutable, "Profile locked");
    }

    function testLockProfileEmitsEvent() public {
        uint256 agentId = _register(operator);

        vm.prank(operator);
        vm.expectEmit(true, false, false, false);
        emit ProfileLocked(agentId);
        registry.lockProfile(agentId);
    }

    function testLockProfileOnlyOwner() public {
        uint256 agentId = _register(operator);

        vm.prank(stranger);
        vm.expectRevert("Not agent owner");
        registry.lockProfile(agentId);
    }

    function testUpdateReputation() public {
        uint256 agentId = _register(operator);

        registry.updateReputation(agentId, 750);

        (, , , uint256 reputationScore, ) = registry.agentProfiles(agentId);
        assertEq(reputationScore, 750);
    }

    function testUpdateReputationOnlyOwner() public {
        uint256 agentId = _register(operator);

        vm.prank(operator);
        vm.expectRevert("Ownable: caller is not the owner");
        registry.updateReputation(agentId, 750);
    }

    function testUpdateReputationOutOfRangeReverts() public {
        uint256 agentId = _register(operator);

        vm.expectRevert("Score range 0-1000");
        registry.updateReputation(agentId, 1001);
    }
}
