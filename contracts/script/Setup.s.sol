// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Agent.sol";
import "../src/AgentToken.sol";
import "../src/BondingCurve.sol";
import "../src/VIRTUAL.sol";
import "../src/Factory.sol";
import "../src/Marketplace.sol";

/// @title Setup
/// @notice Setup script to initialize marketplace state and create initial agents
/// @dev Run after Deploy.s.sol with: forge script script/Setup.s.sol --rpc-url <RPC_URL> --broadcast
contract Setup is Script {
    function run() public {
        address agentAddress = vm.envAddress("AGENT_ADDRESS");
        address agentTokenAddress = vm.envAddress("AGENT_TOKEN_ADDRESS");
        address bondingCurveAddress = vm.envAddress("BONDING_CURVE_ADDRESS");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");
        address virtualAddress = vm.envAddress("VIRTUAL_ADDRESS");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Agent agent = Agent(agentAddress);
        Factory factory = Factory(factoryAddress);
        Marketplace marketplace = Marketplace(marketplaceAddress);
        BondingCurve bondingCurve = BondingCurve(bondingCurveAddress);

        // Create initial test agents
        _createInitialAgents(factory);

        // Initialize marketplace settings
        _setupMarketplace(marketplace);

        // Setup bonding curve initial liquidity (optional)
        _setupBondingCurveLiquidity(agent, bondingCurve);

        vm.stopBroadcast();

        console.log("\n=== Setup Complete ===");
        console.log("Agents created successfully");
        console.log("Marketplace initialized");
        console.log("Bonding curve liquidity configured");
    }

    function _createInitialAgents(Factory factory) internal {
        console.log("\n=== Creating Initial Agents ===");

        // Agent 1: Writing Agent
        (uint256 agentId1, address tokenAddr1) = factory.createAgentWithToken(
            "Content Writer AI",
            "Specialized in creative content writing and copywriting",
            "writing",
            "Content Writer Token",
            "CWT"
        );
        console.log("Created Writing Agent #%d with token: %s", agentId1, tokenAddr1);

        // Agent 2: Research Agent
        (uint256 agentId2, address tokenAddr2) = factory.createAgentWithToken(
            "Research AI",
            "Expert in market research and data analysis",
            "research",
            "Research Token",
            "RST"
        );
        console.log("Created Research Agent #%d with token: %s", agentId2, tokenAddr2);

        // Agent 3: Governance Agent
        (uint256 agentId3, address tokenAddr3) = factory.createAgentWithToken(
            "Governance AI",
            "Specialized in protocol governance and voting",
            "governance",
            "Governance Token",
            "GOV"
        );
        console.log("Created Governance Agent #%d with token: %s", agentId3, tokenAddr3);

        // Agent 4: Butler Agent
        (uint256 agentId4, address tokenAddr4) = factory.createAgentWithToken(
            "Butler AI",
            "Personal assistant for task management and automation",
            "butler",
            "Butler Token",
            "BUT"
        );
        console.log("Created Butler Agent #%d with token: %s", agentId4, tokenAddr4);
    }

    function _setupMarketplace(Marketplace marketplace) internal {
        console.log("\n=== Marketplace Configuration ===");

        // Set initial fee to 2.5% (250 basis points)
        uint256 initialFee = 250;
        marketplace.setFeePercentage(initialFee);
        console.log("Marketplace fee set to: %d basis points (2.5%%)", initialFee);

        // Note: Actual order creation and liquidity setup would be done
        // by users creating orders on their own
    }

    function _setupBondingCurveLiquidity(
        Agent agent,
        BondingCurve bondingCurve
    ) internal {
        console.log("\n=== Bonding Curve Setup ===");

        // Bonding curve doesn't require initialization
        // It uses quadratic pricing model: Price = k * supply^2
        // where k = 1e18

        uint256 testAmount = 100 * 10 ** 18;
        uint256 testPrice = bondingCurve.getBuyPrice(address(0x1234567890123456789012345678901234567890), testAmount);

        console.log("Bonding curve test calculation:");
        console.log("- Amount: %d tokens", testAmount);
        console.log("- Price: %d wei", testPrice);
        console.log("- Formula: k * (supply^2) where k = 1e18");
    }
}
