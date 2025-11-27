// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
 
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

interface IGovernor {
    // Events
    event ProposalCanceled(uint256 proposalId);
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 voteStart,
        uint256 voteEnd,
        string description
    );
    event ProposalExecuted(uint256 proposalId);
    event VoteCast(
        address indexed voter,
        uint256 proposalId,
        uint8 support,
        uint256 weight,
        string reason
    );
    
    // Functions
    function name() external view returns (string memory);
    function version() external view returns (string memory);
    function COUNTING_MODE() external pure returns (string memory);
    
    function proposalThreshold() external view returns (uint256);
    function proposalSnapshot(uint256 proposalId) external view returns (uint256);
    function proposalDeadline(uint256 proposalId) external view returns (uint256);
    function proposalProposer(uint256 proposalId) external view returns (address);
    function proposalEta(uint256 proposalId) external view returns (uint256);
    function proposalNeedsQueuing(uint256 proposalId) external view returns (bool);
    
    function votingDelay() external view returns (uint256);
    function votingPeriod() external view returns (uint256);
    
    function quorum(uint256 blockNumber) external view returns (uint256);
    
    function getVotes(address account, uint256 blockNumber) external view returns (uint256);
    function getVotesWithParams(
        address account,
        uint256 blockNumber,
        bytes memory params
    ) external view returns (uint256);
    
    function hasVoted(uint256 proposalId, address account) external view returns (bool);
    function proposalVotes(uint256 proposalId)
        external
        view
        returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes);
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) external returns (uint256 proposalId);
    
    function queue(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external returns (uint256 proposalId);
    
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external payable returns (uint256 proposalId);
    
    function cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external returns (uint256 proposalId);
    
    function castVote(uint256 proposalId, uint8 support) external returns (uint256 balance);
    function castVoteWithReason(
        uint256 proposalId,
        uint8 support,
        string memory reason
    ) external returns (uint256 balance);
    function castVoteWithReasonAndParams(
        uint256 proposalId,
        uint8 support,
        string memory reason,
        bytes memory params
    ) external returns (uint256 balance);
    function castVoteBySig(
        uint256 proposalId,
        uint8 support,
        address voter,
        bytes memory signature
    ) external returns (uint256 balance);
    
    function state(uint256 proposalId) external view returns (ProposalState);
}

enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed

}
