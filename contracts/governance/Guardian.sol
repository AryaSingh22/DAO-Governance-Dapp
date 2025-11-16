// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Contract to manage guardian functionality for emergency proposal cancellation
 */
contract Guardian is Ownable {
    address public guardian;
    mapping(uint256 => bool) public proposalCanceled;
    
    event GuardianSet(address indexed oldGuardian, address indexed newGuardian);
    event ProposalCanceledByGuardian(uint256 indexed proposalId, address indexed guardian, string reason);

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Guardian: caller is not guardian");
        _;
    }

    constructor() Ownable(msg.sender) {
        guardian = msg.sender; // Initially set to deployer
    }

    function setGuardian(address newGuardian) external onlyOwner {
        address oldGuardian = guardian;
        guardian = newGuardian;
        emit GuardianSet(oldGuardian, newGuardian);
    }

    function emergencyCancelProposal(uint256 proposalId, string calldata reason) external onlyGuardian {
        proposalCanceled[proposalId] = true;
        emit ProposalCanceledByGuardian(proposalId, msg.sender, reason);
    }

    function isProposalCanceled(uint256 proposalId) external view returns (bool) {
        return proposalCanceled[proposalId];
    }
}