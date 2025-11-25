// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; 

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol"; 
 
/**
 * @title ProposalExecutor
 * @dev Handles proposal execution logic separately to reduce the size of the main governor contract
 */
contract ProposalExecutor {
    using Address for address;
    
    address public timelock;
    address public researchRegistry;
    address public reputationManager;
    
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event ResearchPaperApproved(uint256 indexed proposalId, uint256 indexed paperId);
    
    constructor(address _timelock) {
        timelock = _timelock;
    }
    
    /**
     * @dev Set the ResearchRegistry contract address
     * @param _researchRegistry The address of the ResearchRegistry contract
     */
    function setResearchRegistry(address _researchRegistry) external {
        // Access control would be implemented in the main governor contract
        researchRegistry = _researchRegistry;
    }
    
    /**
     * @dev Set the ReputationManager contract address
     * @param _reputationManager The address of the ReputationManager contract
     */
    function setReputationManager(address _reputationManager) external {
        // Access control would be implemented in the main governor contract
        reputationManager = _reputationManager;
    }
    
    /**
     * @dev Execute a proposal
     * @param proposalId The ID of the proposal to execute
     * @param targets The targets of the proposal
     * @param values The values of the proposal
     * @param calldatas The calldatas of the proposal
     * @param descriptionHash The description hash of the proposal
     * @return success Whether the execution was successful
     */
    function executeProposal(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external returns (bool success) {
        // This would be called by the main governor contract
        // Execute the proposal through the timelock
        try TimelockController(timelock).executeBatch{value: msg.value}(targets, values, calldatas, 0, descriptionHash) {
            success = true;
            emit ProposalExecuted(proposalId, true);
            
            // Handle research paper approval if applicable
            // This would be determined by metadata in the main contract
        } catch {
            success = false;
            emit ProposalExecuted(proposalId, false);
        }
        
        return success;
    }
    
    /**
     * @dev Approve a research paper linked to a proposal
     * @param proposalId The ID of the proposal
     * @param paperId The ID of the research paper
     */
    function approveResearchPaper(uint256 proposalId, uint256 paperId) external {
        // This would be called when executing a research proposal
        // In a real implementation, we would call the ResearchRegistry to approve the paper
        emit ResearchPaperApproved(proposalId, paperId);
    }

}


