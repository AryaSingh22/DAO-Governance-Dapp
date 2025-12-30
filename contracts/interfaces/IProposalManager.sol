// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; 

interface IProposalManager { 
    enum ProposalCategory { Finance, Protocol, Community, Emergency, Research }
    
    struct ProposalMetadata {
        string title;
        string description;
        string ipfsCID;
        ProposalCategory category;
        uint256 createdAt;
        bool executed;
        bool canceled;
        uint256 linkedPaperId;
    }
    
    // Events
    event ProposalMetadataSet(uint256 indexed proposalId, string title, string description, string ipfsCID, ProposalCategory category);
    event ResearchPaperLinked(uint256 indexed proposalId, uint256 indexed paperId);
    
    // Functions
    function setProposalMetadata(
        uint256 proposalId,
        string memory title,
        string memory description,
        string memory ipfsCID,
        ProposalCategory category,
        uint256 linkedPaperId
    ) external;
    
    function markProposalExecuted(uint256 proposalId) external;
    
    function getProposalMetadata(uint256 proposalId) external view returns (ProposalMetadata memory);
    function getProposalCategory(uint256 proposalId) external view returns (ProposalCategory);
    function getLinkedPaperId(uint256 proposalId) external view returns (uint256);

}

