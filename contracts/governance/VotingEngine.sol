// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; 

import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {Governor} from "@openzeppelin/contracts/governance/Governor.sol"; 
 
/**
 * @title VotingEngine
 * @dev Handles voting calculations and logic separately to reduce the size of the main governor contract
 */
contract VotingEngine {
    // Mapping to store quadratic vote calculations
    mapping(uint256 => uint256) public quadraticVotes;
    
    // Mapping to store delegation chains
    mapping(address => address[]) public delegationChain;
    mapping(address => address) public delegators;
    
    event QuadraticVoteCast(address indexed voter, uint256 proposalId, uint256 votes, uint256 sqrtVotes);
    event DelegationHierarchyCreated(address indexed delegator, address indexed delegate);
    
    /**
     * @dev Cast a quadratic vote
     * @param proposalId The ID of the proposal to vote on
     * @param votes The number of votes to cast
     * @return sqrtVotes The square root of votes (quadratic voting)
     */
    function castQuadraticVote(uint256 proposalId, uint256 votes) external returns (uint256 sqrtVotes) {
        // Calculate square root of votes for quadratic voting
        sqrtVotes = sqrt(votes);
        quadraticVotes[proposalId] += sqrtVotes;
        
        emit QuadraticVoteCast(msg.sender, proposalId, votes, sqrtVotes);
        return sqrtVotes;
    }
    
    /**
     * @dev Create a delegation hierarchy
     * @param delegate The address to delegate voting power to
     */
    function createDelegation(address delegate) external {
        delegationChain[msg.sender].push(delegate);
        delegators[delegate] = msg.sender;
        
        emit DelegationHierarchyCreated(msg.sender, delegate);
    }
    
    /**
     * @dev Get the delegation chain for an address
     * @param delegator The address to get the delegation chain for
     * @return The delegation chain
     */
    function getDelegationChain(address delegator) external view returns (address[] memory) {
        return delegationChain[delegator];
    }
    
    /**
     * @dev Calculate square root (simplified implementation)
     * @param x The number to calculate the square root of
     * @return The square root
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        if (x == 1) return 1;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }

}


