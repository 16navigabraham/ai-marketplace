// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/Counters.sol";

contract Agent is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    struct AgentMetadata {
        string name;
        string description;
        string agentType; // writing, research, governance, butler
        address creator;
        uint256 createdAt;
    }

    mapping(uint256 => AgentMetadata) public agentMetadata;
    mapping(uint256 => address) public agentTokenAddress; // tokenId -> agent token contract

    event AgentCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string agentType
    );

    event AgentTokenAddressSet(uint256 indexed tokenId, address tokenAddress);

    constructor() ERC721("AI Agent", "AGENT") {}

    function createAgent(
        string memory name,
        string memory description,
        string memory agentType
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(agentType).length > 0, "Agent type cannot be empty");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);

        agentMetadata[tokenId] = AgentMetadata({
            name: name,
            description: description,
            agentType: agentType,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit AgentCreated(tokenId, msg.sender, name, agentType);

        return tokenId;
    }

    function setAgentTokenAddress(uint256 tokenId, address tokenAddress) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can set token address");
        require(tokenAddress != address(0), "Invalid token address");

        agentTokenAddress[tokenId] = tokenAddress;

        emit AgentTokenAddressSet(tokenId, tokenAddress);
    }

    function getAgentMetadata(uint256 tokenId)
        public
        view
        returns (AgentMetadata memory)
    {
        require(_exists(tokenId), "Agent does not exist");
        return agentMetadata[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }
}
