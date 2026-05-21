# ResearchDAO Governance DApp - Feature Documentation
 
## 1. Project Goal

ResearchDAO is a decentralized governance platform for research-focused communities. It combines token voting, NFT membership, research paper submission, treasury execution, and contributor reputation into one workflow.

The project is designed to demonstrate how a DAO can:

- Manage voting power through an ERC20 governance token.
- Restrict advanced community participation through NFT membership.
- Create, vote on, queue, and execute governance proposals.
- Hold and release treasury assets through timelock-governed actions.
- Accept research submissions with token-based fees.
- Track contributor reputation and award NFT badges.
- Expose the complete workflow through a React frontend.

The current public demo deployment is on Sepolia testnet.

## 2. Current Sepolia Deployment

The contracts are deployed and verified on Sepolia.

| Module | Address |
| --- | --- |
| GovernanceToken | `0x8a7f1653C5b02816e988090484350036c914e367` |
| MembershipNFT | `0x90e1A8C456c7396584A2Eb11b419674940635D43` |
| ReputationManager | `0x2D1Ce083a33095C933b6797feeEC51e6541db49B` |
| TimelockController | `0xaB6EB6A66879be41F73975e8CDdE2f1999629111` |
| MyGovernor | `0xc8D715Ca12233844F16FBb586E4b40A55DdB29b5` |
| ResearchRegistry | `0x8248bCa3C6AF3BbD5Ff2cF5A6e473d901ACCd091` |
| Treasury | `0xa52Ce1d01e63D6178d307a1988DC82C17d223634` |

Frontend environment variables are read from `dao-frontend/.env.local` during local development. If the contracts are redeployed, update those `VITE_*_ADDRESS` values.

## 3. Smart Contract Architecture

### 3.1 GovernanceToken

Location: `contracts/core/GovernanceToken.sol`

The governance token is an ERC20 token with voting support. It is the core voting power asset used by the Governor.

Main capabilities:

- ERC20 transfer and balance accounting.
- ERC20Votes checkpointing for governance voting snapshots.
- ERC20Permit support for gasless approval patterns.
- Owner-controlled minting.
- Burn support.
- Pausable transfers.
- Delegation of voting power.

Important behavior:

- Holding tokens is not enough for voting power.
- A user must delegate tokens, often to themselves, before their voting power becomes active.
- Governor proposals use snapshot voting power, so tokens acquired after the snapshot do not affect that proposal.

Demo note:

- For demos, prepare wallets with Sepolia ETH and TDT tokens.
- Self-delegate before showing voting.

### 3.2 MembershipNFT

Location: `contracts/core/MembershipNFT.sol`

MembershipNFT represents DAO membership.

Main capabilities:

- Minting membership NFTs.
- Free or priced membership minting based on configured mint price.
- Maximum supply control.
- Membership status lookup through `isMember`.
- Member token ID lookup.
- Member join timestamp tracking.
- Owner-controlled administrative minting.
- Owner-controlled membership revocation.

Important behavior:

- Membership NFTs are non-transferable after minting.
- Mint and burn are allowed, but direct wallet-to-wallet transfer is blocked.
- This makes membership identity more stable than a normal transferable NFT.

Used by:

- `MyGovernor` checks membership for quadratic voting.

### 3.3 MyGovernor

Location: `contracts/MyGovernor.sol`

MyGovernor is the main governance engine. It extends OpenZeppelin Governor modules and adds DAO-specific features.

Core governance features:

- Proposal creation.
- Token-based voting.
- Vote counting for For, Against, and Abstain.
- Proposal state tracking.
- Timelock-backed queue and execution.
- Proposal threshold.
- Quorum percentage.
- Voting delay.
- Voting period.

Advanced features:

- Proposal metadata:
  - title
  - description
  - IPFS CID
  - category
  - creation timestamp
  - execution status
  - cancellation status
  - voting mode
  - linked research paper ID

- Proposal categories:
  - Finance
  - Protocol
  - Community
  - Emergency

- Voting modes:
  - Standard voting
  - Quadratic voting

- Guardian controls:
  - A guardian can emergency-cancel active or pending proposals.
  - This is useful for testnet demos and emergency safety.

- Delegation hierarchy:
  - Users can create weighted delegation relationships.
  - Delegation chains are bounded to avoid deep or circular delegation issues.

- Reputation integration:
  - Voting can trigger reputation points through `ReputationManager`.

Important behavior:

- Proposals cannot be executed immediately after a vote succeeds.
- Successful proposals must be queued through the timelock.
- Timelock delay must pass before execution.
- Quadratic voting requires the voter to hold a membership NFT.

### 3.4 TimelockController

Location: OpenZeppelin dependency, deployed by `ignition/modules/Governance.ts`

The timelock is the execution authority for governance actions.

Main capabilities:

- Enforces a delay between proposal success and execution.
- Holds proposer and executor permissions.
- Owns governance-controlled contracts after deployment.
- Makes critical protocol changes pass through governance instead of direct owner calls.

Configured roles:

- Governor has proposer role.
- Address zero has executor role, allowing anyone to execute ready queued operations.
- Deployer renounces default admin role after setup.

Demo note:

- Some actions are intentionally not instant.
- This is a governance safety feature, not a frontend bug.

### 3.5 Treasury

Location: `contracts/core/Treasury.sol`

The Treasury manages DAO-controlled assets.

Main capabilities:

- Receive ETH.
- Release ETH.
- Release ERC20 tokens.
- Release ERC721 NFTs.
- Release ERC1155 tokens.
- Create token streams.
- Claim vested stream amounts.
- Fund research through vesting-style streams.
- Guardian emergency pause.
- Owner unpause.

Important behavior:

- Treasury ownership is transferred to the timelock during deployment.
- Treasury release operations should be proposed and executed through governance.
- The frontend includes proposal helpers for treasury ETH release calls.

Demo note:

- If the treasury has no ETH, release proposals can be created but meaningful execution requires treasury funding.

### 3.6 ResearchRegistry

Location: `contracts/ResearchRegistry.sol`

ResearchRegistry stores submitted research metadata and connects papers to governance proposals.

Main capabilities:

- Submit research papers.
- Store paper CID and hash.
- Store title, abstract, authors, category, submitter, timestamp, and submission fee.
- Charge a governance token submission fee.
- Approve papers.
- Reject papers.
- Link papers to governance proposal IDs.
- Return papers by ID.
- Return paginated papers by submitter.
- Track total submitted papers.
- Integrate with reputation points.

Paper categories:

- Computer Science
- Biology
- Physics
- Chemistry
- Mathematics
- Economics
- Other

Paper statuses:

- Submitted
- Approved
- Rejected

Important behavior:

- Submission requires token approval if submission fee is greater than zero.
- The frontend handles approval before submission when needed.
- Paper approval and rejection are owner-only operations, and ownership is transferred to timelock in the deployment.

Demo note:

- A paper submission needs:
  - an IPFS CID or demo CID
  - a valid 32-byte hex hash
  - enough TDT for the submission fee
  - Sepolia ETH for gas

### 3.7 ReputationManager

Location: `contracts/ReputationManager.sol`

ReputationManager tracks contribution points and awards NFT badges.

Main capabilities:

- Add arbitrary reputation points by role.
- Add submission points.
- Add voting points.
- Add review points.
- Track total points, submissions, votes, and reviews.
- Create badge tiers.
- Award badge NFTs when point thresholds are reached.
- Return user badges.
- Return badge metadata.
- Return a placeholder leaderboard array.

Default badges:

| Badge | Requirement |
| --- | --- |
| Researcher | 100 points |
| Contributor | 500 points |
| Expert | 1000 points |
| Visionary | 2000 points |

Important behavior:

- The deployed contract stores badge token URI suffixes such as `researcher.json`.
- The final token URI resolves with the base URI, such as `ipfs://reputation/researcher.json`.
- Reputation manager role is granted to Governor and ResearchRegistry during deployment.

Demo note:

- New demo users may show zero reputation at first.
- Reputation grows after on-chain actions such as submissions and votes.

### 3.8 DAORegistry

Location: `contracts/core/DAORegistry.sol`

DAORegistry is a simple registry for known DAO contract addresses.

Main capabilities:

- Register contract addresses by name.
- Unregister contracts.
- Owner-only administration.
- Prevent zero-address registrations.
- Prevent duplicate registrations.

This contract is useful for future discoverability and system organization.

## 4. Frontend Features

Location: `dao-frontend/src`

The frontend is a React + TypeScript + Vite application. It uses `ethers` for wallet and contract interaction.

### 4.1 Wallet Connection

The app detects an EIP-1193 wallet such as MetaMask.

Main capabilities:

- Connect wallet.
- Display shortened wallet address.
- Read token balance.
- Read voting power.
- Refresh wallet state.

User requirements:

- Wallet must be connected to Sepolia for the testnet deployment.
- User needs Sepolia ETH for gas.

### 4.2 Dashboard

Location: `dao-frontend/src/components/Dashboard.tsx`

Main capabilities:

- Shows total token supply.
- Shows total membership supply.
- Shows treasury ETH balance.
- Shows estimated average voting power.
- Shows simplified treasury stream information.
- Shows placeholder top holder information.
- Provides quick action buttons.

Demo note:

- Some dashboard analytics are simplified because on-chain holder enumeration is not available from a standard ERC20 without indexing.

### 4.3 Governance View

Location: `dao-frontend/src/components/Governance.tsx`

Main capabilities:

- Create governance proposals.
- Generate treasury release calldata.
- Query proposal creation events.
- Show proposal state.
- Show For, Against, and Abstain votes.
- Cast votes.
- Queue succeeded proposals.
- Execute queued proposals.
- Listen for governance events and refresh.

Important behavior:

- Users need delegated voting power before voting.
- Proposals have a delay and voting period.
- Successful proposals must be queued and later executed.
- Execution depends on timelock readiness.

### 4.4 Proposal History

Location: `dao-frontend/src/components/ProposalHistory.tsx`

Main capabilities:

- Lists historical proposals.
- Reads proposal votes.
- Reads proposal state.
- Reads metadata when available.
- Calculates basic analytics:
  - total proposals
  - executed proposals
  - defeated proposals
  - active proposals
  - average participation
  - total votes

### 4.5 Research Submission

Location: `dao-frontend/src/components/ResearchSubmission.tsx`

Main capabilities:

- Reads configured submission fee.
- Accepts title, abstract, authors, category, IPFS CID, and 32-byte hash.
- Validates hash format.
- Checks token allowance.
- Sends approval transaction when allowance is insufficient.
- Submits the paper to ResearchRegistry.
- Shows transaction progress messages.

Important behavior:

- The current Sepolia submission fee is 50 TDT.
- Users need TDT and Sepolia ETH.
- The hash must be exactly bytes32.

### 4.6 Research Archive

Location: `dao-frontend/src/components/ResearchArchive.tsx`

Main capabilities:

- Reads total paper count.
- Loads papers from ResearchRegistry.
- Displays title, authors, abstract, category, status, fee, submission date, and proposal link.
- Filters by category.
- Searches by title, author, or CID.
- Links to IPFS gateway.
- Shows graceful setup messages if a registry address is not configured.

### 4.7 Reputation View

Location: `dao-frontend/src/components/ReputationBadges.tsx`

Main capabilities:

- Reads user reputation from ReputationManager.
- Shows total points.
- Shows submissions, votes, reviews, and earned badges.
- Reads badge tier details.
- Shows badge progress.
- Shows a clear setup state if ReputationManager is not configured.

### 4.8 Token View

Location: `dao-frontend/src/App.tsx`

Main capabilities:

- Shows TDT balance.
- Shows active voting power.
- Allows vote delegation.
- Allows token minting if the connected wallet is token owner.

Important behavior:

- Most demo users cannot mint unless they are the token owner.
- Voting power updates after delegation and transaction confirmation.

## 5. Deployment Flow

Deployment is handled through Hardhat Ignition.

Deployment module:

`ignition/modules/Governance.ts`

Main deployment steps:

1. Deploy GovernanceToken.
2. Deploy TimelockController.
3. Deploy ResearchRegistry.
4. Deploy MembershipNFT.
5. Deploy ReputationManager.
6. Deploy MyGovernor.
7. Deploy Treasury.
8. Grant timelock proposer role to Governor.
9. Grant executor role to address zero.
10. Grant reputation manager role to Governor and ResearchRegistry.
11. Wire Governor and ResearchRegistry to ReputationManager.
12. Transfer ownership of MembershipNFT, ResearchRegistry, and ReputationManager to Timelock.
13. Set Governor guardian.
14. Renounce deployer timelock admin role.

Sepolia deployment command:

```powershell
npx hardhat ignition deploy ignition/modules/Governance.ts --network sepolia
```

Verification command:

```powershell
npx hardhat ignition verify chain-11155111
```

## 6. Environment Configuration

Root `.env` is used by Hardhat.

Required variables:

```env
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

Frontend `.env.local` is used by Vite.

Required variables:

```env
VITE_TOKEN_ADDRESS=
VITE_MEMBERSHIP_NFT_ADDRESS=
VITE_REPUTATION_MANAGER_ADDRESS=
VITE_TIMELOCK_ADDRESS=
VITE_GOVERNOR_ADDRESS=
VITE_RESEARCH_REGISTRY_ADDRESS=
VITE_TREASURY_ADDRESS=
```

Security note:

- Never commit `.env`.
- Never share private keys.
- Use a dedicated demo wallet for testnet deployments.

## 7. Demo Preparation Checklist

Before presenting:

1. Open the frontend.
2. Confirm MetaMask is on Sepolia.
3. Confirm the demo wallet has Sepolia ETH.
4. Confirm the wallet has TDT.
5. Self-delegate TDT in the Token view.
6. Prepare a demo IPFS CID.
7. Prepare a valid bytes32 hash.
8. Prepare a short research title and abstract.
9. Explain timelock delay before showing queue and execute.
10. Keep the verified Etherscan links ready.

Recommended presentation flow:

1. Show dashboard.
2. Connect wallet.
3. Show token balance and voting power.
4. Delegate votes.
5. Submit a research paper.
6. Show the paper in the research archive.
7. Create or inspect a governance proposal.
8. Vote on a proposal.
9. Show reputation and badge progress.
10. Open Etherscan verification links for credibility.

## 8. What May Need Updating

Update contract addresses if:

- You redeploy contracts.
- You switch testnet.
- You reset an Ignition deployment.
- You deploy a new version after contract edits.

Update frontend logic if:

- Contract ABIs change.
- Function names or parameters change.
- New proposal workflows are added.
- Research categories change.
- Reputation badge rules change.

Update demo materials if:

- Sepolia RPC provider changes.
- Etherscan links change after redeploy.
- Submission fee changes.
- Voting delay, voting period, quorum, or timelock delay changes.

## 9. Current Limitations

This project is demo-ready on testnet, but it is not a production DAO yet.

Known limitations:

- Dashboard holder analytics are simplified.
- Leaderboard returns placeholder data from the contract.
- Proposal indexing depends on event queries from the connected RPC.
- Testnet RPCs can be slow or rate-limited.
- Treasury actions require treasury funding.
- Admin actions are timelock-governed after deployment.
- No dedicated backend/indexer is currently included.
- No production IPFS upload flow is bundled into the frontend.

Production improvements:

- Add a backend or subgraph for proposal, holder, and research indexing.
- Add a real IPFS upload service.
- Add richer transaction status handling.
- Add role/admin dashboards for timelock proposals.
- Add end-to-end frontend tests.
- Add deployment scripts that write frontend env files automatically.
- Perform a full security audit before mainnet.

## 10. Testing and Quality

Contract tests:

```powershell
npm test
```

Frontend build:

```powershell
cd dao-frontend
npm run build
```

Frontend lint:

```powershell
cd dao-frontend
npm run lint
```

Current verified status:

- Smart contract test suite passes.
- Frontend production build passes.
- Frontend lint passes.
- Sepolia contracts are deployed and verified.

## 11. Summary

ResearchDAO demonstrates a full DAO workflow for research communities:

- Tokens provide voting power.
- NFT membership supports identity and quadratic voting.
- Governor manages proposals and votes.
- Timelock enforces execution safety.
- Treasury manages DAO assets.
- ResearchRegistry records paper submissions.
- ReputationManager rewards useful participation.
- React frontend ties the workflow together for demos.

For a presentation, emphasize that this is a live Sepolia deployment showing the end-to-end concept, with mainnet-readiness requiring stronger indexing, better operational tooling, and a security audit.
