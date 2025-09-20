// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {GovernorTimelockControl} from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";     
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**             
 * Enhanced Governor with proposal metadata, guardian role, and advanced features
 */
contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    Ownable
{
    enum ProposalCategory { Finance, Protocol, Community, Emergency }
    enum VotingMode { Standard, Quadratic }
    
    struct ProposalMetadata {
        string title;
        string description;
        string ipfsCID;
        ProposalCategory category;
        uint256 createdAt;
        bool executed;
        bool canceled;
        VotingMode votingMode;
    }

    struct DelegationNode {
        address delegate;
        uint256 weight;
        bool active;
    }

    address public guardian;
    mapping(uint256 => ProposalMetadata) public proposalMetadata;
    mapping(uint256 => bool) public proposalCanceled;
    
    // Delegation hierarchy mappings
    mapping(address => DelegationNode[]) public delegationChain;
    mapping(address => address) public delegators;
    mapping(uint256 => uint256) public quadraticVotes; // proposalId => sqrtVotes
    
    event GuardianSet(address indexed oldGuardian, address indexed newGuardian);
    event ProposalMetadataSet(uint256 indexed proposalId, string title, string description, string ipfsCID, ProposalCategory category, VotingMode votingMode);
    event ProposalCanceledByGuardian(uint256 indexed proposalId, address indexed guardian, string reason);
    event DelegationHierarchyCreated(address indexed delegator, address indexed delegate, uint256 weight);
    event QuadraticVoteCast(address indexed voter, uint256 proposalId, uint256 votes, uint256 sqrtVotes);

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Governor: caller is not guardian");
        _;
    }

    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercent
    )
        Governor("MyGovernor")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercent)
        GovernorTimelockControl(_timelock)
        Ownable(msg.sender)
    {
        guardian = msg.sender; // Initially set to deployer
    }

    // Guardian management
    function setGuardian(address newGuardian) external onlyOwner {
        address oldGuardian = guardian;
        guardian = newGuardian;
        emit GuardianSet(oldGuardian, newGuardian);
    }

    // Emergency proposal cancellation by guardian
    function emergencyCancelProposal(uint256 proposalId, string calldata reason) external onlyGuardian {
        require(state(proposalId) == ProposalState.Active || state(proposalId) == ProposalState.Pending, "Cannot cancel");
        
        proposalCanceled[proposalId] = true;
        emit ProposalCanceledByGuardian(proposalId, msg.sender, reason);
    }

    // Enhanced propose function with metadata and voting mode
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory ipfsCID,
        ProposalCategory category,
        VotingMode votingMode
    ) public returns (uint256) {
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        proposalMetadata[proposalId] = ProposalMetadata({
            title: title,
            description: description,
            ipfsCID: ipfsCID,
            category: category,
            createdAt: block.timestamp,
            executed: false,
            canceled: false,
            votingMode: votingMode
        });
        
        emit ProposalMetadataSet(proposalId, title, description, ipfsCID, category, votingMode);
        return proposalId;
    }

    // Simplified propose function with default standard voting
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory ipfsCID,
        ProposalCategory category
    ) public returns (uint256) {
        return proposeWithMetadata(targets, values, calldatas, title, description, ipfsCID, category, VotingMode.Standard);
    }

    // Override state to check for guardian cancellation
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        if (proposalCanceled[proposalId]) {
            return ProposalState.Canceled;
        }
        return super.state(proposalId);
    }

    // Override execute to mark as executed
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable override returns (uint256) {
        uint256 proposalId = super.execute(targets, values, calldatas, descriptionHash);
        proposalMetadata[proposalId].executed = true;
        return proposalId;
    }

    // Quadratic voting implementation
    function castQuadraticVote(uint256 proposalId, uint8 support, uint256 votes) public {
        require(state(proposalId) == ProposalState.Active, "Governor: vote not currently active");
        require(votes > 0, "Governor: votes must be positive");
        
        // Calculate square root of votes for quadratic voting
        uint256 sqrtVotes = Math.sqrt(votes * 1e18) / 1e9; // Scale to maintain precision
        
        // Check if user has enough voting power
        uint256 availableVotes = getVotes(msg.sender, block.timestamp);
        require(availableVotes >= votes, "Governor: insufficient voting power");
        
        // Record quadratic vote
        quadraticVotes[proposalId] = sqrtVotes;
        
        // Cast vote with quadratic weight
        _countVote(proposalId, msg.sender, support, sqrtVotes, "");
        
        emit QuadraticVoteCast(msg.sender, proposalId, votes, sqrtVotes);
    }

    // Delegation hierarchy functions
    function createDelegationChain(address delegate, uint256 weight) external {
        require(delegate != msg.sender, "Cannot delegate to self");
        require(weight > 0, "Weight must be positive");
        require(weight <= 100, "Weight cannot exceed 100%");
        
        // Check if user has voting power
        uint256 votingPower = getVotes(msg.sender, block.timestamp);
        require(votingPower > 0, "No voting power to delegate");
        
        // Add to delegation chain
        delegationChain[msg.sender].push(DelegationNode({
            delegate: delegate,
            weight: weight,
            active: true
        }));
        
        delegators[delegate] = msg.sender;
        
        emit DelegationHierarchyCreated(msg.sender, delegate, weight);
    }

    function updateDelegationWeight(address delegate, uint256 newWeight) external {
        DelegationNode[] storage chain = delegationChain[msg.sender];
        for (uint256 i = 0; i < chain.length; i++) {
            if (chain[i].delegate == delegate) {
                require(newWeight <= 100, "Weight cannot exceed 100%");
                chain[i].weight = newWeight;
                return;
            }
        }
        revert("Delegation not found");
    }

    function removeDelegation(address delegate) external {
        DelegationNode[] storage chain = delegationChain[msg.sender];
        for (uint256 i = 0; i < chain.length; i++) {
            if (chain[i].delegate == delegate) {
                chain[i].active = false;
                delete delegators[delegate];
                return;
            }
        }
        revert("Delegation not found");
    }

    // Helper function to calculate delegated voting power
    function getDelegatedVotingPower(address voter) public view returns (uint256) {
        uint256 totalPower = getVotes(voter, block.timestamp);
        address current = voter;
        
        // Traverse delegation chain
        while (delegators[current] != address(0)) {
            address delegator = delegators[current];
            DelegationNode[] storage chain = delegationChain[delegator];
            
            for (uint256 i = 0; i < chain.length; i++) {
                if (chain[i].delegate == current && chain[i].active) {
                    // Apply delegation weight
                    uint256 delegatorPower = getVotes(delegator, block.timestamp);
                    totalPower += (delegatorPower * chain[i].weight) / 100;
                    break;
                }
            }
            current = delegator;
        }
        
        return totalPower;
    }

    // View functions
    function getProposalMetadata(uint256 proposalId) external view returns (ProposalMetadata memory) {
        return proposalMetadata[proposalId];
    }

    function getProposalCategory(uint256 proposalId) external view returns (ProposalCategory) {
        return proposalMetadata[proposalId].category;
    }

    function isProposalCanceled(uint256 proposalId) external view returns (bool) {
        return proposalCanceled[proposalId];
    }

    function getProposalVotingMode(uint256 proposalId) external view returns (VotingMode) {
        return proposalMetadata[proposalId].votingMode;
    }

    // The following functions are overrides required by Solidity.
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // Explicitly resolve proposalThreshold ambiguity to GovernorSettings implementation
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }
}
