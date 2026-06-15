// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract AgentRegistry is ERC721, Ownable {
    enum LifecycleStatus { PENDING, ACTIVATING, ACTIVE, SUSPENDED }

    struct CharacterCard {
        string allowedActions;
        uint256 spendingLimit;
        string targetProtocols;
        bool isImmutable;
    }

    struct AgentProfile {
        string name;
        string description;
        LifecycleStatus status;
        uint256 reputationScore;
        uint256 registrationTimestamp;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => AgentProfile) public agentProfiles;
    mapping(uint256 => CharacterCard) public characterCards;

    event AgentRegistered(uint256 indexed agentId, address indexed operator, string name);
    event StatusUpdated(uint256 indexed agentId, LifecycleStatus status);
    event ProfileLocked(uint256 indexed agentId);

    constructor() ERC721("Synapse Agent Registry", "SYNAPSE") Ownable() {}

    function registerAgent(
        string memory name,
        string memory description,
        string memory allowedActions,
        uint256 spendingLimit,
        string memory targetProtocols
    ) external returns (uint256) {
        uint256 agentId = ++_nextTokenId;
        _safeMint(msg.sender, agentId);

        agentProfiles[agentId] = AgentProfile({
            name: name,
            description: description,
            status: LifecycleStatus.PENDING,
            reputationScore: 500, // Default mid-level reputation score
            registrationTimestamp: block.timestamp
        });

        characterCards[agentId] = CharacterCard({
            allowedActions: allowedActions,
            spendingLimit: spendingLimit,
            targetProtocols: targetProtocols,
            isImmutable: false
        });

        emit AgentRegistered(agentId, msg.sender, name);
        return agentId;
    }

    function setLifecycleStatus(uint256 agentId, LifecycleStatus status) external {
        require(ownerOf(agentId) == msg.sender || msg.sender == owner(), "Not authorized");
        agentProfiles[agentId].status = status;
        emit StatusUpdated(agentId, status);
    }

    function lockProfile(uint256 agentId) external {
        require(ownerOf(agentId) == msg.sender, "Not agent owner");
        characterCards[agentId].isImmutable = true;
        emit ProfileLocked(agentId);
    }

    function updateReputation(uint256 agentId, uint256 newScore) external onlyOwner {
        require(newScore <= 1000, "Score range 0-1000");
        agentProfiles[agentId].reputationScore = newScore;
    }
}
