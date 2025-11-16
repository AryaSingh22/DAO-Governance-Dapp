// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Contract to manage proposal metadata separately from the governor
 */
contract ProposalMetadataManager is Ownable {
    enum ProposalCategory { Finance, Protocol, Community, Emergency, Research }
    
    struct ProposalMetadata {
        string title;
        string description;
        string ipfsCID;
        ProposalCategory category;
        uint256 createdAt;
        bool executed;
        bool canceled;
        uint256 linkedPaperId; // For Research proposals
    }

    mapping(uint256 => ProposalMetadata) public proposalMetadata;
    
    event ProposalMetadataSet(uint256 indexed proposalId, string title, string description, string ipfsCID, ProposalCategory category);
    event ResearchPaperLinked(uint256 indexed proposalId, uint256 indexed paperId);

    constructor() Ownable(msg.sender) {}

    function setProposalMetadata(
        uint256 proposalId,
        string memory title,
        string memory description,
        string memory ipfsCID,
        ProposalCategory category,
        uint256 linkedPaperId
    ) external onlyOwner {
        proposalMetadata[proposalId] = ProposalMetadata({
            title: title,
            description: description,
            ipfsCID: ipfsCID,
            category: category,
            createdAt: block.timestamp,
            executed: false,
            canceled: false,
            linkedPaperId: linkedPaperId
        });
        
        emit ProposalMetadataSet(proposalId, title, description, ipfsCID, category);
        
        // If this is a research proposal, link the paper
        if (category == ProposalCategory.Research && linkedPaperId > 0) {
            emit ResearchPaperLinked(proposalId, linkedPaperId);
        }
    }

    function markProposalExecuted(uint256 proposalId) external onlyOwner {
        proposalMetadata[proposalId].executed = true;
    }

    function getProposalMetadata(uint256 proposalId) external view returns (ProposalMetadata memory) {
        return proposalMetadata[proposalId];
    }

    function getProposalCategory(uint256 proposalId) external view returns (ProposalCategory) {
        return proposalMetadata[proposalId].category;
    }

    function getLinkedPaperId(uint256 proposalId) external view returns (uint256) {
        return proposalMetadata[proposalId].linkedPaperId;
    }
}