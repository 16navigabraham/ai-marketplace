// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/Counters.sol";

/// @title Agent
/// @notice ERC-721 NFT contract representing AI agents in the marketplace
/// @dev Each agent is an NFT with metadata and an associated ERC-20 token
contract Agent is ERC721, Ownable {
    using Counters for Counters.Counter;

    /// @dev Counter for tracking token IDs
    Counters.Counter private _tokenIds;

    /// @notice Metadata struct for an agent
    struct AgentMetadata {
        /// @dev The name of the agent
        string name;
        /// @dev The description of the agent
        string description;
        /// @dev The type of agent (writing, research, governance, butler)
        string agentType;
        /// @dev The address of the agent creator
        address creator;
        /// @dev The timestamp when the agent was created
        uint256 createdAt;
    }

    /// @notice Mapping from token ID to agent metadata
    mapping(uint256 => AgentMetadata) public agentMetadata;

    /// @notice Mapping from token ID to associated ERC-20 token address
    mapping(uint256 => address) public agentTokenAddress;

    /// @notice Addresses authorized to mint agents (e.g. the Factory)
    mapping(address => bool) public minters;

    /// @notice Emitted when a minter is authorized or revoked
    event MinterSet(address indexed minter, bool allowed);

    /// @notice Restrict a call to the owner or an authorized minter
    modifier onlyMinter() {
        require(msg.sender == owner() || minters[msg.sender], "Not authorized to mint");
        _;
    }

    /// @notice Emitted when a new agent is created
    /// @param tokenId The ID of the created agent NFT
    /// @param creator The address of the agent creator
    /// @param name The name of the agent
    /// @param agentType The type of the agent
    event AgentCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string agentType
    );

    /// @notice Emitted when an agent's token address is set
    /// @param tokenId The ID of the agent
    /// @param tokenAddress The address of the associated ERC-20 token
    event AgentTokenAddressSet(uint256 indexed tokenId, address tokenAddress);

    /// @notice Initialize the Agent contract
    constructor() ERC721("AI Agent", "AGENT") {}

    /// @notice Authorize or revoke an address that may mint agents
    /// @dev Only the contract owner can manage minters
    /// @param minter The address to update
    /// @param allowed Whether the address may mint
    function setMinter(address minter, bool allowed) public onlyOwner {
        require(minter != address(0), "Invalid minter");
        minters[minter] = allowed;
        emit MinterSet(minter, allowed);
    }

    /// @notice Create a new agent NFT owned by the caller
    /// @dev Restricted to the owner or an authorized minter
    function createAgent(
        string memory name,
        string memory description,
        string memory agentType
    ) public onlyMinter returns (uint256) {
        return createAgentFor(msg.sender, name, description, agentType);
    }

    /// @notice Create a new agent NFT owned by `creatorAddr`
    /// @dev Lets the Factory mint the agent to the real user (not itself), so
    /// ownership, metadata.creator, and the creator fee all point to the user.
    /// @param creatorAddr The address that owns the agent and earns creator fees
    /// @return tokenId The ID of the created agent NFT
    function createAgentFor(
        address creatorAddr,
        string memory name,
        string memory description,
        string memory agentType
    ) public onlyMinter returns (uint256) {
        require(creatorAddr != address(0), "Invalid creator");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(agentType).length > 0, "Agent type cannot be empty");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        // _mint (not _safeMint): mint to the real creator.
        _mint(creatorAddr, tokenId);

        agentMetadata[tokenId] = AgentMetadata({
            name: name,
            description: description,
            agentType: agentType,
            creator: creatorAddr,
            createdAt: block.timestamp
        });

        emit AgentCreated(tokenId, creatorAddr, name, agentType);

        return tokenId;
    }

    /// @notice Set the ERC-20 token address for an agent
    /// @dev The agent owner, an authorized minter (Factory), or the owner may set
    /// it — the Factory needs this because the NFT is minted to the user, not itself.
    /// @param tokenId The ID of the agent
    /// @param tokenAddress The address of the ERC-20 token
    function setAgentTokenAddress(uint256 tokenId, address tokenAddress) public {
        require(
            ownerOf(tokenId) == msg.sender || minters[msg.sender] || msg.sender == owner(),
            "Not authorized to set token address"
        );
        require(tokenAddress != address(0), "Invalid token address");

        agentTokenAddress[tokenId] = tokenAddress;

        emit AgentTokenAddressSet(tokenId, tokenAddress);
    }

    /// @notice Get the metadata for an agent
    /// @param tokenId The ID of the agent
    /// @return metadata The agent's metadata
    function getAgentMetadata(uint256 tokenId)
        public
        view
        returns (AgentMetadata memory)
    {
        require(_exists(tokenId), "Agent does not exist");
        return agentMetadata[tokenId];
    }

    /// @notice Get the total number of agents created
    /// @return The total count of agents
    function getTotalAgents() public view returns (uint256) {
        return _tokenIds.current();
    }

    // Note: `_exists(uint256)` is inherited from OpenZeppelin ERC721.
}
