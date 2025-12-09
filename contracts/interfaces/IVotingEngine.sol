// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.24; 
 
interface IVotingEngine {
    // Events
    event QuadraticVoteCast(address indexed voter, uint256 proposalId, uint256 votes, uint256 sqrtVotes);
    event DelegationHierarchyCreated(address indexed delegator, address indexed delegate);
    
    // Functions
    function castQuadraticVote(uint256 proposalId, uint256 votes) external returns (uint256 sqrtVotes);
    function createDelegation(address delegate) external;
    function getDelegationChain(address delegator) external view returns (address[] memory);

}



