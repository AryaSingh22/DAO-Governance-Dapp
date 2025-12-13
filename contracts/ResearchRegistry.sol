// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 

/**
 * Research Registry - stores research papers submitted to the DAO
 * Links papers to governance proposals and tracks approval status
 */
contract ResearchRegistry is Ownable, ReentrancyGuard {
    enum PaperStatus { Submitted, Approved, Rejected }
    enum PaperCategory { ComputerScience, Biology, Physics, Chemistry, Mathematics, Economics, Other }
    
    struct ResearchPaper {
        uint256 id;
        string cid; // IPFS CID
        bytes32 hash; // SHA256 hash for verification
        string title;
        string paperAbstract;
        string[] authors;
        PaperCategory category;
        PaperStatus status;
        address submitter;
        uint256 submissionTime;
        uint256 proposalId; // Link to governance proposal
        uint256 submissionFee;
    }
    
    uint256 private _paperIds;
    uint256 public submissionFee; // Configurable fee in wei
    address public governanceToken; // Token used for submission fee
    
    mapping(uint256 => ResearchPaper) public papers;
    mapping(uint256 => uint256) public paperIdToProposalId; // paperId => proposalId
    mapping(address => uint256[]) public userPapers; // user => paperIds
    
    event PaperSubmitted(
        uint256 indexed paperId,
        address indexed submitter,
        string title,
        string cid,
        bytes32 hash
    );
    
    event PaperApproved(
        uint256 indexed paperId,
        uint256 indexed proposalId,
        address indexed approver
    );
    
    event PaperRejected(
        uint256 indexed paperId,
        address indexed rejecter,
        string reason
    );
    
    event SubmissionFeeSet(uint256 newFee);
    
    constructor(
        address _governanceToken,
        uint256 _submissionFee
    ) Ownable(msg.sender) {
        governanceToken = _governanceToken;
        submissionFee = _submissionFee;
    }
    
    /**
     * @dev Submit a research paper to the registry
     * @param _cid IPFS CID of the paper
     * @param _hash SHA256 hash of the paper for verification
     * @param _title Title of the paper
     * @param _abstract Abstract of the paper
     * @param _authors Array of author names
     * @param _category Category of the paper
     */
    function submitPaper(
        string memory _cid,
        bytes32 _hash,
        string memory _title,
        string memory _abstract,
        string[] memory _authors,
        PaperCategory _category
    ) external nonReentrant returns (uint256) {
        // Charge submission fee
        if (submissionFee > 0) {
            require(
                IERC20(governanceToken).transferFrom(
                    msg.sender, 
                    address(this),
                    submissionFee
                ),
                "Fee transfer failed"
            );
        }
        
        _paperIds++;
        uint256 newPaperId = _paperIds;
        
        ResearchPaper storage paper = papers[newPaperId];
        paper.id = newPaperId;
        paper.cid = _cid;
        paper.hash = _hash;
        paper.title = _title;
        paper.paperAbstract = _abstract;
        paper.authors = _authors;
        paper.category = _category;
        paper.status = PaperStatus.Submitted;
        paper.submitter = msg.sender;
        paper.submissionTime = block.timestamp;
        paper.proposalId = 0; // Will be set when linked to proposal
        paper.submissionFee = submissionFee;
        
        userPapers[msg.sender].push(newPaperId);
        
        emit PaperSubmitted(newPaperId, msg.sender, _title, _cid, _hash);
        
        return newPaperId;
    }
    
    /**
     * @dev Link a paper to a governance proposal
     * @param _paperId ID of the paper
     * @param _proposalId ID of the governance proposal
     */
    function linkProposal(
        uint256 _paperId,
        uint256 _proposalId
    ) external onlyOwner {
        ResearchPaper storage paper = papers[_paperId];
        require(paper.id != 0, "Paper does not exist");
        require(paper.proposalId == 0, "Paper already linked to a proposal");
        
        paper.proposalId = _proposalId;
        paperIdToProposalId[_paperId] = _proposalId;
    }
    
    /**
     * @dev Approve a research paper (called by governance contract)
     * @param _paperId ID of the paper to approve
     */
    function approvePaper(uint256 _paperId) external onlyOwner {
        ResearchPaper storage paper = papers[_paperId];
        require(paper.id != 0, "Paper does not exist");
        require(paper.status == PaperStatus.Submitted, "Paper not in submitted status");
        
        paper.status = PaperStatus.Approved;
        
        emit PaperApproved(_paperId, paper.proposalId, msg.sender);
    }
    
    /**
     * @dev Reject a research paper
     * @param _paperId ID of the paper to reject
     * @param _reason Reason for rejection
     */
    function rejectPaper(uint256 _paperId, string calldata _reason) external onlyOwner {
        ResearchPaper storage paper = papers[_paperId];
        require(paper.id != 0, "Paper does not exist");
        require(paper.status == PaperStatus.Submitted, "Paper not in submitted status");
        
        paper.status = PaperStatus.Rejected;
        
        emit PaperRejected(_paperId, msg.sender, _reason);
    }
    
    /**
     * @dev Set the submission fee
     * @param _newFee New submission fee in wei
     */
    function setSubmissionFee(uint256 _newFee) external onlyOwner {
        submissionFee = _newFee;
        emit SubmissionFeeSet(_newFee);
    }
    
    /**
     * @dev Get a paper by its ID
     * @param _paperId ID of the paper
     * @return ResearchPaper struct
     */
    function getPaperById(uint256 _paperId) external view returns (ResearchPaper memory) {
        return papers[_paperId];
    }
    
    /**
     * @dev Get all papers submitted by a user
     * @param _user Address of the user
     * @return Array of paper IDs
     */
    function getPapersByUser(address _user) external view returns (uint256[] memory) {
        return userPapers[_user];
    }
    
    /**
     * @dev Get total number of papers
     * @return Total number of papers
     */
    function getTotalPapers() external view returns (uint256) {
        return _paperIds;
    }

}

