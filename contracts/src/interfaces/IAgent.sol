// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IAgent
/// @notice Interface for the Agent NFT contract
interface IAgent {
    /// @notice Metadata struct for an agent
    struct AgentMetadata {
        string name;
        string description;
        string agentType;
        address creator;
        uint256 createdAt;
    }

    /// @notice Create a new agent
    /// @param name The name of the agent
    /// @param description The description of the agent
    /// @param agentType The type of agent (writing, research, governance, butler)
    /// @return tokenId The ID of the created agent NFT
    function createAgent(
        string memory name,
        string memory description,
        string memory agentType
    ) external returns (uint256);

    /// @notice Set the token address for an agent
    /// @param tokenId The ID of the agent
    /// @param tokenAddress The address of the agent's ERC-20 token
    function setAgentTokenAddress(uint256 tokenId, address tokenAddress) external;

    /// @notice Get metadata for an agent
    /// @param tokenId The ID of the agent
    /// @return metadata The agent's metadata
    function getAgentMetadata(uint256 tokenId)
        external
        view
        returns (AgentMetadata memory);

    /// @notice Get the token address for an agent
    /// @param tokenId The ID of the agent
    /// @return tokenAddress The address of the agent's ERC-20 token
    function agentTokenAddress(uint256 tokenId)
        external
        view
        returns (address);

    /// @notice Event emitted when an agent is created
    event AgentCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string agentType
    );

    /// @notice Event emitted when an agent's token address is set
    event AgentTokenAddressSet(uint256 indexed tokenId, address tokenAddress);
}
