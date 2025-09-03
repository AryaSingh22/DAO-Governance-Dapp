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
  const governor = m.contract("MyGovernor", [
    token,
    timelock,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercent,
  ]);
  const treasury = m.contract("Treasury", [timelock]);

  // Deploy Membership NFT
  const membershipNFT = m.contract("MembershipNFT", [
    "DAO Membership",
    "DAO",
    "https://ipfs.io/ipfs/",
    0n, // mintPrice (free)
    1000n, // maxSupply
  ]);

  // Set up Timelock roles
  const PROPOSER_ROLE = m.staticCall(timelock, "PROPOSER_ROLE", []);
  const EXECUTOR_ROLE = m.staticCall(timelock, "EXECUTOR_ROLE", []);

  m.call(timelock, "grantRole", [PROPOSER_ROLE, governor], { id: "grantProposerRole" });
  // Allow anyone to execute by giving executor role to address(0)
  m.call(timelock, "grantRole", [EXECUTOR_ROLE, "0x0000000000000000000000000000000000000000"], { id: "grantExecutorRole" });

  // Transfer ownership of Membership NFT to Timelock (Treasury is already owned by timelock)
  m.call(membershipNFT, "transferOwnership", [timelock], { id: "transferMembershipOwnership" });

  // Set Guardian roles
  // Governor will be the guardian for Governor
  m.call(governor, "setGuardian", [m.getAccount(0)], { id: "setGovernorGuardian" });

  return { token, timelock, governor, treasury, membershipNFT };
});

export default GovernanceModule;