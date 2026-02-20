# ResearchDAO Security Review & Verification Report

**Version:** 2.0 (Final)
**Date:** 2026-02-20
**Scope:** ResearchDAO Governance Core
**Status:** 🟡 REMEDIATED - READY FOR AUDIT

## 1. Scope and Methodology

The following files were subject to line-level verification against the security requirements:

| File | Path | SHA256 (Partial) |
|---|---|---|
| MyGovernor.sol | `contracts/MyGovernor.sol` | [Current State] |
| Treasury.sol | `contracts/core/Treasury.sol` | [Current State] |
| ReputationManager.sol | `contracts/ReputationManager.sol` | [Current State] |
| ResearchRegistry.sol | `contracts/ResearchRegistry.sol` | [Current State] |
| Governance.ts | `ignition/modules/Governance.ts` | [Current State] |

## 2. Line-Level Verification

| Claim | File | Line(s) | Confirmed? |
|-------|------|---------|------------|
| getPastVotes used for voting power | MyGovernor.sol | L188 | YES |
| MembershipNFT gate on castQuadraticVote | MyGovernor.sol | L192 | YES |
| Cycle detection in createDelegationChain | MyGovernor.sol | L215-219 | YES (Fixed) |
| MAX_DELEGATION_DEPTH defined and enforced | MyGovernor.sol | L55, L217, L346 | YES |
| nonReentrant on fundResearch | Treasury.sol | L108 | YES (Fixed) |
| nonReentrant on releaseStream/releaseETH | Treasury.sol | L70, L79, L130 | YES |
| ETH transfer AFTER state update (CEI) | Treasury.sol | L141-147 | YES |
| Treasury owner is Timelock not EOA | Treasury.sol / Gov.ts | L45 / L45 | YES |
| REPUTATION_MANAGER_ROLE defined | ReputationManager.sol | L14 | YES |
| addSubmissionPoints requires role | ReputationManager.sol | L119 | YES |
| addVotingPoints requires role | ReputationManager.sol | L132 | YES |
| nextBadgeTier tracked per user | ReputationManager.sol | L36, L162 | YES |
| getPapersByUser has offset+limit params | ResearchRegistry.sol | L205 | YES |
| approvePaper calls addReviewPoints | ResearchRegistry.sol | L159 | YES |
| submitPaper calls addSubmissionPoints | ResearchRegistry.sol | L122 | YES |
| TIMELOCK_ADMIN_ROLE renounced | Governance.ts | L75 | YES |
| ResearchRegistry deployed and wired | Governance.ts | L16, L63 | YES |
| ReputationManager deployed and wired | Governance.ts | L28, L62 | YES |
| REPUTATION_MANAGER_ROLE granted to Registry | Governance.ts | L59 | YES |
| REPUTATION_MANAGER_ROLE granted to Governor | Governance.ts | L58 | YES |
| castQuadraticVote ABI in contracts.ts | contracts.ts | L92 | YES |
| getPapersByUser uses offset+limit in frontend | contracts.ts | L315 | YES |

## 3. Resolved Vulnerabilities

The following critical issues were identified and resolved during this final pass:

| ID | Severity | Title | Affected Component | Description \& Fix |
|---|---|---|---|---|
| **VULN-01** | **CRITICAL** | Incorrect Delegation Cycle Detection | `MyGovernor.sol` L215 | **Issue:** The cycle check logic walked up from `delegate` instead of `msg.sender`, incorrectly checking if the *child* was an ancestor of the *parent*. This failed to detect actual cycles (where `msg.sender` is an ancestor of `delegate`).<br>**Fix:** Changed start node to `msg.sender` and checked against `delegate` to correctly detect if `delegate` is already an ancestor. |
| **VULN-02** | **MEDIUM** | Missing Reentrancy Guard | `Treasury.sol` L108 | **Issue:** The `fundResearch` and `createStream` functions updated state based on `address(this).balance` but lacked `nonReentrant` modifiers.<br>**Fix:** Added `nonReentrant` to both external functions to adhere to Checks-Effects-Interactions (CEI) best practices. |
| **VULN-03** | **HIGH** | Timelock Admin Retained | `Governance.ts` L75 | **Issue:** Renouncement of `TIMELOCK_ADMIN_ROLE` was commented out.<br>**Fix:** Uncommented to ensure deployer loses control post-deployment. |
| **VULN-04** | **HIGH** | Missing Reputation Hooks | `ResearchRegistry.sol` | **Issue:** Paper approval did not trigger reputation changes.<br>**Fix:** Added `reputationManager.addReviewPoints` call on approval. |

## 4. Remaining Risks

These risks persist in the design and must be acknowledged or mitigated operationally.

| ID | Severity | Title | Description | Recommendation | Owner |
|---|---|---|---|---|---|
| **RISK-01** | **MEDIUM** | Gas Limit in Reputation Loops | `ReputationManager` loops through badges. If badge count grows (>50), transactions may revert. | Limit total badge tiers or implement pagination for badge checking. | Governance |
| **RISK-02** | **LOW** | IPFS Content Availability | Proposal metadata and Research Papers rely on IPFS CIDs. If IPFS content is lost, descriptions vanish. | Use pinned IPFS services (Pinata/Infura) and redundant storage. | Ops Team |
| **RISK-03** | **LOW** | Quadratic Sybil Resistance | MembershipNFT limits Q-voting, but NFTs can be transferred/bought if logic allows. | Ensure `MembershipNFT` minting policy is strict (e.g., non-transferable or KYC-based). | Governance |

## 5. Pre-Mainnet Checklist

- [ ] **Testnet Deployment:** Deploy to Sepolia using `ignition/modules/Governance.ts`.
- [ ] **Etherscan Verification:** Verify all contract source code.
- [ ] **Smoke Test:**
    - [ ] Create Proposal.
    - [ ] Cast Vote (Quadratic).
    - [ ] Delegate Votes.
    - [ ] Execute Proposal affecting Treasury.
- [ ] **Timelock Handoff:** Confirm `TIMELOCK_ADMIN_ROLE` is `0x0` or `Timelock` itself.
- [ ] **Frontend Config:** Update `contracts.ts` and `.env` with new addresses.

## 6. Audit Firm Guidance

**To the Auditors:**
- **Custom Logic Focus:** Please scrutinize `MyGovernor.castQuadraticVote`. We use OpenZeppelin `Math.sqrt` on `getPastVotes`.
- **Delegation:** We implemented a custom cycle detection in `MyGovernor.createDelegationChain`. Verify the graph traversal logic logic at L215.
- **Treasury:** Verify that `fundResearch` (alias for `createStream`) strictly adheres to `Ownable` (Timelock) and cannot be exploited to drain funds.
- **Assumptions:** We assume `MembershipNFT` is the sole gatekeeper for Quadratic Voting. We assume `GovernanceToken` is standard ERC20Votes.
