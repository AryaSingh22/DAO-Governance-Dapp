// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IGovernanceToken {
    function getVotes(address account) external view returns (uint256);
    function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);
}

contract MyGovernor {
    struct Proposal {
        uint256 id;
        address proposer;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // Constants
    uint256 public constant VOTING_DELAY = 1;      // 1 block delay
    uint256 public constant VOTING_PERIOD = 45818; // ~1 week
    uint256 public constant PROPOSAL_THRESHOLD = 0;
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% quorum

    // State variables
    IGovernanceToken public token;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    // Events
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address[] targets,
        uint256[] values,
        bytes[] calldatas,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(address indexed voter, uint256 proposalId, bool support, uint256 weight);
    event ProposalExecuted(uint256 proposalId);

    constructor(IGovernanceToken _token) {
        token = _token;
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        require(
            token.getVotes(msg.sender) >= proposalThreshold(),
            "Governor: proposer votes below threshold"
        );
        require(
            targets.length == values.length && targets.length == calldatas.length,
            "Governor: invalid proposal length"
        );

        uint256 proposalId = hashProposal(targets, values, calldatas, keccak256(bytes(description)));
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.startBlock == 0, "Governor: proposal already exists");

        uint256 snapshot = block.number + votingDelay();
        uint256 deadline = snapshot + votingPeriod();

        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.description = description;
        proposal.startBlock = snapshot;
        proposal.endBlock = deadline;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            targets,
            values,
            calldatas,
            description,
            snapshot,
            deadline
        );

        return proposalId;
    }

    function castVote(uint256 proposalId, bool support) public returns (uint256) {
        Proposal storage proposal = proposals[proposalId];
        require(state(proposalId) == ProposalState.Active, "Governor: vote not currently active");
        require(!proposal.hasVoted[msg.sender], "Governor: vote already cast");

        uint256 weight = token.getPastVotes(msg.sender, proposal.startBlock);
        require(weight > 0, "Governor: no voting weight");

        proposal.hasVoted[msg.sender] = true;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(msg.sender, proposalId, support, weight);
        return weight;
    }

    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        require(state(proposalId) == ProposalState.Succeeded, "Governor: proposal not successful");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;

        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call{value: values[i]}(calldatas[i]);
            require(success, "Governor: call reverted");
        }

        emit ProposalExecuted(proposalId);
        return proposalId;
    }

    function hashProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(targets, values, calldatas, descriptionHash)));
    }

    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.startBlock > 0, "Governor: unknown proposal id");

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (block.number <= proposal.startBlock) {
            return ProposalState.Pending;
        }

        if (block.number <= proposal.endBlock) {
            return ProposalState.Active;
        }

        if (_quorumReached(proposalId) && _voteSucceeded(proposalId)) {
            return ProposalState.Succeeded;
        }

        return ProposalState.Defeated;
    }

    function _quorumReached(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.forVotes + proposal.againstVotes) * 100 >= token.getPastVotes(address(this), proposal.startBlock) * QUORUM_PERCENTAGE;
    }

    function _voteSucceeded(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        return proposal.forVotes > proposal.againstVotes;
    }

    function votingDelay() public pure returns (uint256) {
        return VOTING_DELAY;
    }

    function votingPeriod() public pure returns (uint256) {
        return VOTING_PERIOD;
    }

    function proposalThreshold() public pure returns (uint256) {
        return PROPOSAL_THRESHOLD;
    }

    enum ProposalState {
        Pending,
        Active,
        Defeated,
        Succeeded,
        Executed
    }
} 