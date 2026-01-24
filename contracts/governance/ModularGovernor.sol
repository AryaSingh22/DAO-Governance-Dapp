// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; 

import {BaseGovernor} from "./BaseGovernor.sol";
import {ProposalMetadataManager} from "./ProposalMetadataManager.sol"; 
import {Guardian} from "./Guardian.sol";
import {VotingEngine} from "./VotingEngine.sol";
import {ProposalExecutor} from "./ProposalExecutor.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * Modular Governor that delegates functionality to separate contracts to reduce size
 */
contract ModularGovernor is BaseGovernor {
    ProposalMetadataManager public metadataManager;
    Guardian public guardianManager;
    VotingEngine public votingEngine;
    ProposalExecutor public proposalExecutor;
    
    // Research registry address
    address public researchRegistry;

    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercent,
        ProposalMetadataManager _metadataManager,
        Guardian _guardianManager,
        VotingEngine _votingEngine,
        ProposalExecutor _proposalExecutor
    )
        BaseGovernor(_token, _timelock, _votingDelay, _votingPeriod, _proposalThreshold, _quorumPercent)
    {
        metadataManager = _metadataManager;
        guardianManager = _guardianManager;
        votingEngine = _votingEngine;
        proposalExecutor = _proposalExecutor;
    }

    // Set ResearchRegistry contract address
    function setResearchRegistry(address _researchRegistry) external {
        // Only owner can set this
        require(msg.sender == owner(), "Only owner can set research registry");
        researchRegistry = _researchRegistry;
        proposalExecutor.setResearchRegistry(_researchRegistry);
    }

    // Enhanced propose function with metadata
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory ipfsCID,
        ProposalMetadataManager.ProposalCategory category,
        uint256 linkedPaperId
    ) public returns (uint256) {
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        metadataManager.setProposalMetadata(proposalId, title, description, ipfsCID, category, linkedPaperId);
        
        return proposalId;
    }

    // Simplified propose function with default parameters
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory ipfsCID,
        ProposalMetadataManager.ProposalCategory category
    ) public returns (uint256) {
        return proposeWithMetadata(targets, values, calldatas, title, description, ipfsCID, category, 0);
    }

    // Emergency proposal cancellation by guardian
    function emergencyCancelProposal(uint256 proposalId, string calldata reason) external {
        guardianManager.emergencyCancelProposal(proposalId, reason);
    }

    // Override state to check for guardian cancellation
    function state(uint256 proposalId)
        public
        view
        override
        returns (ProposalState)
    {
        if (guardianManager.isProposalCanceled(proposalId)) {
            return ProposalState.Canceled;
        }
        return super.state(proposalId);
    }

    // Override execute to use the proposal executor
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable override returns (uint256) {
        uint256 proposalId = super.execute(targets, values, calldatas, descriptionHash);
        metadataManager.markProposalExecuted(proposalId);
        
        // Execute the proposal through the proposal executor
        proposalExecutor.executeProposal(proposalId, targets, values, calldatas, descriptionHash);
        
        // If this is a research proposal, automatically approve the linked paper
        ProposalMetadataManager.ProposalCategory category = metadataManager.getProposalCategory(proposalId);
        uint256 linkedPaperId = metadataManager.getLinkedPaperId(proposalId);
        
        if (category == ProposalMetadataManager.ProposalCategory.Research && 
            linkedPaperId > 0 && 
            researchRegistry != address(0)) {
            proposalExecutor.approveResearchPaper(proposalId, linkedPaperId);
        }
        
        return proposalId;
    }

    // Quadratic voting function
    function castQuadraticVote(uint256 proposalId, uint256 votes) external returns (uint256 sqrtVotes) {
        return votingEngine.castQuadraticVote(proposalId, votes);
    }
    
    // Delegation function
    function createDelegation(address delegate) external {
        votingEngine.createDelegation(delegate);
    }

    // View functions delegated to metadata manager
    function getProposalMetadata(uint256 proposalId) external view returns (ProposalMetadataManager.ProposalMetadata memory) {
        return metadataManager.getProposalMetadata(proposalId);
    }

    function getProposalCategory(uint256 proposalId) external view returns (ProposalMetadataManager.ProposalCategory) {
        return metadataManager.getProposalCategory(proposalId);
    }

    function getLinkedPaperId(uint256 proposalId) external view returns (uint256) {
        return metadataManager.getLinkedPaperId(proposalId);
    }
    
    // View functions delegated to voting engine
    function getDelegationChain(address delegator) external view returns (address[] memory) {
        return votingEngine.getDelegationChain(delegator);
    }

}





