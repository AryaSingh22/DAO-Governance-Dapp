# ResearchDAO Technical Documentation

## Overview

ResearchDAO is an enhanced Decentralized Autonomous Organization (DAO) platform specifically designed for research collaboration and governance. It extends the basic DAO functionality with research-specific features including paper submission, reputation management, and research funding mechanisms.

## Core Components

### 1. ResearchRegistry.sol

The ResearchRegistry contract manages research paper submissions, verification, and approval processes.

#### Key Features:
- **Paper Submission**: Researchers can submit papers with metadata, IPFS CID, and SHA256 hash verification
- **Submission Fees**: Configurable fees in governance tokens to prevent spam
- **Approval Workflow**: Owner-controlled approval/rejection of submitted papers
- **Proposal Linking**: Integration with governance proposals for research funding
- **Category System**: Classification of papers into research domains

#### Data Structures:
```solidity
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
```

#### Key Functions:
- `submitPaper()`: Submit a research paper with fee payment
- `approvePaper()`: Approve a submitted paper (owner only)
- `rejectPaper()`: Reject a submitted paper with reason (owner only)
- `linkProposal()`: Link a paper to a governance proposal (owner only)
- `setSubmissionFee()`: Update submission fee (owner only)
- `getPaperById()`: Retrieve paper details by ID
- `getPapersByUser()`: Get all papers submitted by a user

### 2. ReputationManager.sol

The ReputationManager contract tracks user contributions and awards NFT badges based on participation.

#### Key Features:
- **Points System**: Track contributions across submissions, votes, and reviews
- **Badge Tiers**: NFT-based recognition system with progressive rewards
- **Automatic Awarding**: Badges awarded automatically when point thresholds are reached
- **Leaderboard**: View top contributors in the DAO

#### Data Structures:
```solidity
struct BadgeTier {
    string name;
    string description;
    uint256 pointsRequired;
    string tokenURI;
}

struct UserReputation {
    uint256 totalPoints;
    uint256 submissions;
    uint256 votes;
    uint256 reviews;
    mapping(uint256 => bool) badges; // badgeId => owned
}
```

#### Default Badge Tiers:
1. **Researcher** (100 points): Submitted first research paper
2. **Contributor** (500 points): Active community contributor
3. **Expert** (1000 points): Recognized domain expert
4. **Visionary** (2000 points): DAO visionary and leader

#### Key Functions:
- `addPoints()`: Add arbitrary points to user (owner only)
- `addSubmissionPoints()`: Add points for paper submission (owner only)
- `addVotingPoints()`: Add points for voting (owner only)
- `addReviewPoints()`: Add points for reviewing papers (owner only)
- `createBadgeTier()`: Create new badge tier (owner only)
- `getUserReputation()`: Get user's reputation data
- `getUserBadges()`: Get user's earned badges
- `getBadgeDetails()`: Get details of a badge tier

### 3. Enhanced MyGovernor.sol

The enhanced Governor contract adds research-specific proposal categories and paper linking.

#### Key Features:
- **Research Category**: Dedicated proposal category for research funding
- **Paper Linking**: Associate governance proposals with research papers
- **Metadata Extension**: Enhanced proposal metadata with categories

#### Key Functions:
- `proposeWithMetadata()`: Create proposals with extended metadata including paper linking
- `getProposalCategory()`: Get the category of a proposal
- `getLinkedPaperId()`: Get the research paper linked to a proposal
- `setResearchRegistry()`: Set the research registry contract address (owner only)
- `setReputationManager()`: Set the reputation manager contract address (owner only)

### 4. Enhanced Treasury.sol

The enhanced Treasury contract adds research funding capabilities.

#### Key Features:
- **Research Funding**: Dedicated function for streaming payments to researchers
- **Time-based Payments**: Vesting schedule for research grants

#### Key Functions:
- `fundResearch()`: Create a streaming payment for research funding
- `createStream()`: Create general streaming payments (inherited)
- `claimStream()`: Claim available streaming payments (inherited)

## Frontend Components

### 1. ResearchSubmission.tsx

Interface for submitting research papers with:
- Metadata form (title, abstract, authors, category)
- IPFS CID input
- SHA256 hash verification
- Submission fee display
- Transaction status feedback

### 2. ResearchArchive.tsx

Research paper archive with:
- Filterable paper listings
- Paper details display
- Status indicators (submitted, approved, rejected)
- Author information
- Category filtering

### 3. ReputationBadges.tsx

Reputation system interface with:
- User reputation dashboard
- Badge display with details
- Points breakdown (submissions, votes, reviews)
- Leaderboard of top contributors

## Integration Flow

### Paper Submission Process:
1. User submits paper through ResearchSubmission component
2. Paper is stored in ResearchRegistry with submission fee
3. Proposal can be created linking to the paper
4. Community votes on the proposal
5. If approved, research is funded through Treasury

### Reputation System:
1. Users earn points for:
   - Paper submissions (+50 points)
   - Voting on proposals (+10 points)
   - Reviewing papers (+25 points)
2. Badges are automatically awarded when point thresholds are reached
3. Reputation is displayed in the ReputationBadges component

## Security Considerations

### Access Control:
- All administrative functions are protected by `onlyOwner` modifier
- Paper approval/rejection requires owner privileges
- Badge creation and point allocation require owner privileges

### Fee Management:
- Submission fees are transferred using `transferFrom` with proper approval
- Fees are held in the contract until withdrawn by owner

### Data Integrity:
- SHA256 hashes ensure paper content integrity
- IPFS CIDs provide decentralized storage
- All paper data is stored on-chain for transparency

## Testing

### Unit Tests:
- ResearchRegistry tests cover paper submission, approval, and fee management
- ReputationManager tests cover point allocation, badge awarding, and reputation tracking
- Integration tests verify the complete workflow from paper submission to proposal creation

### Test Coverage:
- Contract deployment and initialization
- Paper submission with valid and invalid data
- Fee payment and transfer handling
- Approval and rejection workflows
- Proposal linking functionality
- Reputation point allocation
- Badge tier creation and awarding
- User reputation tracking

## Deployment

### Contract Addresses:
- ResearchRegistry: To be deployed
- ReputationManager: To be deployed
- MyGovernor: Enhanced with research features
- Treasury: Enhanced with research funding
- GovernanceToken: Unchanged
- MembershipNFT: Unchanged

### Deployment Steps:
1. Deploy GovernanceToken
2. Deploy MembershipNFT
3. Deploy TimelockController
4. Deploy ResearchRegistry
5. Deploy ReputationManager
6. Deploy enhanced MyGovernor with research features
7. Deploy enhanced Treasury with research funding
8. Initialize contract relationships
9. Update frontend configuration

## Future Enhancements

### Planned Features:
- Peer review system for submitted papers
- Automated plagiarism detection integration
- Research impact metrics and analytics
- Cross-DAO collaboration mechanisms
- Advanced reputation algorithms
- Research grant proposal templates
- Off-chain indexing for improved searchability

### Scalability Improvements:
- Layer 2 integration for reduced gas costs
- Batch operations for multiple paper submissions
- Optimized data structures for large paper archives
- Caching mechanisms for frequently accessed data

## API Reference

### ResearchRegistry Events:
- `PaperSubmitted`: Emitted when a paper is submitted
- `PaperApproved`: Emitted when a paper is approved
- `PaperRejected`: Emitted when a paper is rejected
- `SubmissionFeeSet`: Emitted when submission fee is updated

### ReputationManager Events:
- `PointsAdded`: Emitted when points are added to a user
- `BadgeAwarded`: Emitted when a badge is awarded to a user
- `BadgeTierCreated`: Emitted when a new badge tier is created

### Enhanced Governor Events:
- `ProposalMetadataSet`: Emitted when proposal metadata is set
- `ResearchPaperLinked`: Emitted when a paper is linked to a proposal

### Enhanced Treasury Events:
- `ResearchFunded`: Emitted when research is funded

## Troubleshooting

### Common Issues:
1. **Submission Fee Errors**: Ensure sufficient token balance and approval
2. **Paper Approval Failures**: Verify caller has owner privileges
3. **Badge Awarding Issues**: Check point thresholds and badge tier configuration
4. **Proposal Linking Errors**: Verify paper exists and isn't already linked

### Debugging Tips:
- Check contract balances for fee collection
- Verify paper status before approval/rejection
- Monitor event logs for transaction details
- Use blockchain explorers to verify on-chain data

## Contributing

### Development Guidelines:
1. Follow Solidity best practices and style guides
2. Write comprehensive tests for new features
3. Document all public functions and events
4. Maintain backward compatibility when possible
5. Submit pull requests with detailed descriptions

### Testing Requirements:
- All new functions must have unit tests
- Integration tests for cross-contract interactions
- Gas optimization for user-facing functions
- Security review for owner-only functions