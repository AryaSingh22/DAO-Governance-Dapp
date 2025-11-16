import { ethers, run } from "hardhat";

async function main() {
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deployment parameters
  const votingDelay = 1; // 1 block
  const votingPeriod = 600; // ~10 minutes on testnet (1 block = 1 second)
  const proposalThreshold = ethers.parseEther("1"); // 1 token
  const quorumPercent = 4; // 4%
  const timelockDelay = 86400; // 24 hours
  const mintPrice = 0; // Free minting
  const maxSupply = 10000; // 10,000 memberships

  console.log("Deploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("core/GovernanceToken");
  const token = await GovernanceToken.deploy();
  await token.waitForDeployment();
  console.log("GovernanceToken deployed to:", token.target);

  console.log("Deploying TimelockController...");
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(timelockDelay, [], [], deployer.address);
  await timelock.waitForDeployment();
  console.log("TimelockController deployed to:", timelock.target);

  console.log("Deploying ProposalMetadataManager...");
  const MetadataManager = await ethers.getContractFactory("governance/ProposalMetadataManager");
  const metadataManager = await MetadataManager.deploy();
  await metadataManager.waitForDeployment();
  console.log("ProposalMetadataManager deployed to:", metadataManager.target);

  console.log("Deploying Guardian...");
  const Guardian = await ethers.getContractFactory("governance/Guardian");
  const guardian = await Guardian.deploy();
  await guardian.waitForDeployment();
  console.log("Guardian deployed to:", guardian.target);

  console.log("Deploying VotingEngine...");
  const VotingEngine = await ethers.getContractFactory("governance/VotingEngine");
  const votingEngine = await VotingEngine.deploy();
  await votingEngine.waitForDeployment();
  console.log("VotingEngine deployed to:", votingEngine.target);

  console.log("Deploying ProposalExecutor...");
  const ProposalExecutor = await ethers.getContractFactory("governance/ProposalExecutor");
  const proposalExecutor = await ProposalExecutor.deploy(timelock.target);
  await proposalExecutor.waitForDeployment();
  console.log("ProposalExecutor deployed to:", proposalExecutor.target);

  console.log("Deploying ModularGovernor...");
  const Governor = await ethers.getContractFactory("governance/ModularGovernor");
  const governor = await Governor.deploy(
    token.target,
    timelock.target,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercent,
    metadataManager.target,
    guardian.target,
    votingEngine.target,
    proposalExecutor.target
  );
  await governor.waitForDeployment();
  console.log("ModularGovernor deployed to:", governor.target);

  console.log("Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("core/Treasury");
  const treasury = await Treasury.deploy(timelock.target);
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", treasury.target);

  console.log("Deploying MembershipNFT...");
  const MembershipNFT = await ethers.getContractFactory("core/MembershipNFT");
  const membershipNFT = await MembershipNFT.deploy(
    "DAO Membership",
    "DAO",
    "https://ipfs.io/ipfs/",
    mintPrice,
    maxSupply
  );
  await membershipNFT.waitForDeployment();
  console.log("MembershipNFT deployed to:", membershipNFT.target);

  console.log("Deploying DAORegistry...");
  const DAORegistry = await ethers.getContractFactory("core/DAORegistry");
  const daoRegistry = await DAORegistry.deploy();
  await daoRegistry.waitForDeployment();
  console.log("DAORegistry deployed to:", daoRegistry.target);

  // Setup roles
  console.log("Setting up roles...");
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();

  // Grant proposer role to governor
  await timelock.grantRole(PROPOSER_ROLE, governor.target);
  console.log("Granted PROPOSER_ROLE to Governor");

  // Allow anyone to execute by giving executor role to address(0)
  await timelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress);
  console.log("Granted EXECUTOR_ROLE to ZeroAddress");

  // Grant canceller role to governor (for proposal cancellations)
  await timelock.grantRole(CANCELLER_ROLE, governor.target);
  console.log("Granted CANCELLER_ROLE to Governor");

  // Transfer ownership of Treasury and Membership NFT to Timelock
  await treasury.transferOwnership(timelock.target);
  console.log("Transferred Treasury ownership to Timelock");

  await membershipNFT.transferOwnership(timelock.target);
  console.log("Transferred MembershipNFT ownership to Timelock");

  // Set Guardian roles
  await treasury.setGuardian(governor.target);
  console.log("Set Treasury guardian to Governor");

  // Set guardian for the guardian contract to the governor
  await guardian.transferOwnership(governor.target);
  console.log("Transferred Guardian ownership to Governor");

  // Set metadata manager owner to the governor
  await metadataManager.transferOwnership(governor.target);
  console.log("Transferred MetadataManager ownership to Governor");

  // Register contracts in the DAO registry
  console.log("Registering contracts in DAORegistry...");
  await daoRegistry.registerContract("GovernanceToken", token.target);
  await daoRegistry.registerContract("TimelockController", timelock.target);
  await daoRegistry.registerContract("ProposalMetadataManager", metadataManager.target);
  await daoRegistry.registerContract("Guardian", guardian.target);
  await daoRegistry.registerContract("VotingEngine", votingEngine.target);
  await daoRegistry.registerContract("ProposalExecutor", proposalExecutor.target);
  await daoRegistry.registerContract("ModularGovernor", governor.target);
  await daoRegistry.registerContract("Treasury", treasury.target);
  await daoRegistry.registerContract("MembershipNFT", membershipNFT.target);
  console.log("Registered all contracts in DAORegistry");

  // Verify contracts on Etherscan (if not on localhost)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) { // Not localhost
    console.log("Verifying contracts on Etherscan...");
    
    try {
      await run("verify:verify", {
        address: token.target,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying GovernanceToken:", error);
    }

    try {
      await run("verify:verify", {
        address: timelock.target,
        constructorArguments: [timelockDelay, [], [], deployer.address],
      });
    } catch (error) {
      console.log("Error verifying Timelock:", error);
    }

    try {
      await run("verify:verify", {
        address: metadataManager.target,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying MetadataManager:", error);
    }

    try {
      await run("verify:verify", {
        address: guardian.target,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying Guardian:", error);
    }

    try {
      await run("verify:verify", {
        address: votingEngine.target,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying VotingEngine:", error);
    }

    try {
      await run("verify:verify", {
        address: proposalExecutor.target,
        constructorArguments: [timelock.target],
      });
    } catch (error) {
      console.log("Error verifying ProposalExecutor:", error);
    }

    try {
      await run("verify:verify", {
        address: governor.target,
        constructorArguments: [
          token.target,
          timelock.target,
          votingDelay,
          votingPeriod,
          proposalThreshold,
          quorumPercent,
          metadataManager.target,
          guardian.target,
          votingEngine.target,
          proposalExecutor.target
        ],
      });
    } catch (error) {
      console.log("Error verifying Governor:", error);
    }

    try {
      await run("verify:verify", {
        address: treasury.target,
        constructorArguments: [timelock.target],
      });
    } catch (error) {
      console.log("Error verifying Treasury:", error);
    }

    try {
      await run("verify:verify", {
        address: membershipNFT.target,
        constructorArguments: [
          "DAO Membership",
          "DAO",
          "https://ipfs.io/ipfs/",
          mintPrice,
          maxSupply
        ],
      });
    } catch (error) {
      console.log("Error verifying MembershipNFT:", error);
    }

    try {
      await run("verify:verify", {
        address: daoRegistry.target,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying DAORegistry:", error);
    }
  }

  // Save contract addresses
  console.log("\n=== CONTRACT ADDRESSES ===");
  console.log("GovernanceToken:", token.target);
  console.log("TimelockController:", timelock.target);
  console.log("ProposalMetadataManager:", metadataManager.target);
  console.log("Guardian:", guardian.target);
  console.log("VotingEngine:", votingEngine.target);
  console.log("ProposalExecutor:", proposalExecutor.target);
  console.log("ModularGovernor:", governor.target);
  console.log("Treasury:", treasury.target);
  console.log("MembershipNFT:", membershipNFT.target);
  console.log("DAORegistry:", daoRegistry.target);

  // Save to frontend config
  const fs = require("fs");
  const configPath = "./dao-frontend/src/config/contracts.ts";
  
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, "utf8");
    
    configContent = configContent.replace(
      /export const GOVERNOR_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `export const GOVERNOR_ADDRESS = "${governor.target}";`
    );
    
    configContent = configContent.replace(
      /export const TIMELOCK_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `export const TIMELOCK_ADDRESS = "${timelock.target}";`
    );
    
    configContent = configContent.replace(
      /export const TREASURY_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `export const TREASURY_ADDRESS = "${treasury.target}";`
    );
    
    configContent = configContent.replace(
      /export const TOKEN_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `export const TOKEN_ADDRESS = "${token.target}";`
    );
    
    configContent = configContent.replace(
      /export const MEMBERSHIP_NFT_ADDRESS = "0x[a-fA-F0-9]{40}";/,
      `export const MEMBERSHIP_NFT_ADDRESS = "${membershipNFT.target}";`
    );
    
    // Add new contract addresses
    // Check if the file already contains the new addresses
    if (!configContent.includes("VOTING_ENGINE_ADDRESS")) {
      // Insert before the last line (export)
      const lines = configContent.split("\n");
      lines.splice(lines.length - 1, 0, `export const VOTING_ENGINE_ADDRESS = "${votingEngine.target}";`);
      lines.splice(lines.length - 1, 0, `export const PROPOSAL_EXECUTOR_ADDRESS = "${proposalExecutor.target}";`);
      lines.splice(lines.length - 1, 0, `export const DAO_REGISTRY_ADDRESS = "${daoRegistry.target}";`);
      configContent = lines.join("\n");
    }
    
    fs.writeFileSync(configPath, configContent);
    console.log("\nUpdated frontend configuration file");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Check Etherscan for verified contracts");
  console.log("2. Test basic functionality through the frontend");
  console.log("3. Save the contract addresses above for future reference");
  console.log("4. Review the DEPLOYMENT_CHECKLIST.md for post-deployment tasks");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });