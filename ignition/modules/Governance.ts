import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GovernanceModule = buildModule("GovernanceModule", (m) => {
  const votingDelay = m.getParameter("votingDelay", 1n); // 1 block
  const votingPeriod = m.getParameter("votingPeriod", 20n); // 20 blocks for local testing
  const proposalThreshold = m.getParameter("proposalThreshold", 1000000000000000000n); // 1 token (1e18)
  const quorumPercent = m.getParameter("quorumPercent", 4n);
  const timelockDelay = m.getParameter("timelockDelay", 3600n); // 1 hour

  // Deploy core contracts
  const token = m.contract("GovernanceToken", []);
  const timelock = m.contract("TimelockController", [timelockDelay, [], [], m.getAccount(0)]);

  // Deploy ResearchRegistry
  const submissionFee = m.getParameter("submissionFee", 50000000000000000000n); // 50 tokens
  const researchRegistry = m.contract("ResearchRegistry", [token, submissionFee]);

  // Deploy Membership NFT
  const membershipNFT = m.contract("MembershipNFT", [
    "DAO Membership",
    "DAO",
    "https://ipfs.io/ipfs/",
    0n, // mintPrice (free)
    1000n, // maxSupply
  ]);

  // Deploy ReputationManager
  const reputationManager = m.contract("ReputationManager", [
    "ResearchDAO Reputation",
    "REP",
    "ipfs://reputation/",
  ]);

  // Deploy Governor
  const governor = m.contract("MyGovernor", [
    token,
    timelock,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercent,
    membershipNFT,
  ]);

  const treasury = m.contract("Treasury", [timelock]);

  // Set up Timelock roles
  const PROPOSER_ROLE = m.staticCall(timelock, "PROPOSER_ROLE", []);
  const EXECUTOR_ROLE = m.staticCall(timelock, "EXECUTOR_ROLE", []);
  const DEFAULT_ADMIN_ROLE = m.staticCall(timelock, "DEFAULT_ADMIN_ROLE", []);

  m.call(timelock, "grantRole", [PROPOSER_ROLE, governor], { id: "grantProposerRole" });
  // Allow anyone to execute by giving executor role to address(0)
  m.call(timelock, "grantRole", [EXECUTOR_ROLE, "0x0000000000000000000000000000000000000000"], { id: "grantExecutorRole" });

  // Setup ReputationManager roles
  const REPUTATION_MANAGER_ROLE = m.staticCall(reputationManager, "REPUTATION_MANAGER_ROLE", []);
  m.call(reputationManager, "grantRole", [REPUTATION_MANAGER_ROLE, governor], { id: "grantReputationManagerRoleToGovernor" });
  m.call(reputationManager, "grantRole", [REPUTATION_MANAGER_ROLE, researchRegistry], { id: "grantReputationManagerRoleToRegistry" });

  // Wiring managers
  m.call(governor, "setReputationManager", [reputationManager], { id: "setGovernorReputationManager" });
  m.call(researchRegistry, "setReputationManager", [reputationManager], { id: "setRegistryReputationManager" });

  // Transfer ownerships to Timelock
  m.call(membershipNFT, "transferOwnership", [timelock], { id: "transferMembershipOwnership" });
  m.call(researchRegistry, "transferOwnership", [timelock], { id: "transferRegistryOwnership" });
  m.call(reputationManager, "transferOwnership", [timelock], { id: "transferReputationOwnership" });

  // Set Guardian roles
  // Governor will be the guardian for Governor
  m.call(governor, "setGuardian", [m.getAccount(0)], { id: "setGovernorGuardian" });

  // Renounce Timelock Admin role (optional for testnet, usually done at end)
  m.call(timelock, "renounceRole", [DEFAULT_ADMIN_ROLE, m.getAccount(0)], { id: "renounceTimelockAdmin" });

  return { token, timelock, governor, treasury, membershipNFT, researchRegistry, reputationManager };
});

export default GovernanceModule;
