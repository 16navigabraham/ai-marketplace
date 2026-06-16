// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Treasury.sol";

contract TreasuryTest is Test {
    Treasury treasury;
    address contributor = address(0x111);
    address stranger = address(0x222);

    event BountyPaid(address indexed contributor, uint256 amount, string reason);
    event FundsReceived(address indexed sender, uint256 amount);

    function setUp() public {
        treasury = new Treasury();
        vm.deal(address(this), 100 ether);
    }

    function testReceiveTracksFees() public {
        (bool ok, ) = address(treasury).call{value: 1 ether}("");
        assertTrue(ok);

        assertEq(address(treasury).balance, 1 ether, "Balance updated");
        assertEq(treasury.totalProtocolFeesCollected(), 1 ether, "Fees tracked");
    }

    function testReceiveEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit FundsReceived(address(this), 2 ether);
        (bool ok, ) = address(treasury).call{value: 2 ether}("");
        assertTrue(ok);
    }

    function testReceiveAccumulates() public {
        (bool a, ) = address(treasury).call{value: 1 ether}("");
        (bool b, ) = address(treasury).call{value: 3 ether}("");
        assertTrue(a && b);
        assertEq(treasury.totalProtocolFeesCollected(), 4 ether, "Fees accumulate");
    }

    function testPayBugBounty() public {
        (bool ok, ) = address(treasury).call{value: 5 ether}("");
        assertTrue(ok);

        uint256 before = contributor.balance;
        treasury.payBugBounty(contributor, 2 ether, "Critical vuln");

        assertEq(contributor.balance - before, 2 ether, "Bounty paid out");
        assertEq(address(treasury).balance, 3 ether, "Treasury reduced");
    }

    function testPayBugBountyEmitsEvent() public {
        (bool ok, ) = address(treasury).call{value: 5 ether}("");
        assertTrue(ok);

        vm.expectEmit(true, false, false, true);
        emit BountyPaid(contributor, 1 ether, "Bug report");
        treasury.payBugBounty(contributor, 1 ether, "Bug report");
    }

    function testPayBugBountyInsufficientReverts() public {
        vm.expectRevert("Insufficient treasury balance");
        treasury.payBugBounty(contributor, 1 ether, "No funds");
    }

    function testPayBugBountyOnlyOwner() public {
        (bool ok, ) = address(treasury).call{value: 5 ether}("");
        assertTrue(ok);

        vm.prank(stranger);
        vm.expectRevert("Ownable: caller is not the owner");
        treasury.payBugBounty(contributor, 1 ether, "x");
    }

    function testWithdraw() public {
        (bool ok, ) = address(treasury).call{value: 5 ether}("");
        assertTrue(ok);

        uint256 before = address(this).balance;
        treasury.withdraw(2 ether);

        assertEq(address(this).balance - before, 2 ether, "Owner withdraws");
        assertEq(address(treasury).balance, 3 ether, "Treasury reduced");
    }

    function testWithdrawInsufficientReverts() public {
        vm.expectRevert("Insufficient treasury balance");
        treasury.withdraw(1 ether);
    }

    function testWithdrawOnlyOwner() public {
        (bool ok, ) = address(treasury).call{value: 5 ether}("");
        assertTrue(ok);

        vm.prank(stranger);
        vm.expectRevert("Ownable: caller is not the owner");
        treasury.withdraw(1 ether);
    }

    // This test contract is the Treasury owner; it must accept ETH on withdraw.
    receive() external payable {}
}
