const { ethers } = require("hardhat");

async function main() {
  console.log("Testing modular deployment...");
  
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deployment parameters
  const votingDelay = 1;
  const votingPeriod = 600;
  const proposalThreshold = ethers.parseEther("1");
  const quorumPercent = 4;
  const timelockDelay = 86400;
  
  try {
    // Deploy core contracts
    console.log("Deploying GovernanceToken...");
    const GovernanceToken = await ethers.getContractFactory("core/GovernanceToken");
    const token = await GovernanceToken.deploy();
    await token.waitForDeployment();
    console.log("✓ GovernanceToken deployed to:", token.target);
    
    console.log("Deploying TimelockController...");
    const Timelock = await ethers.getContractFactory("TimelockController");
    const timelock = await Timelock.deploy(timelockDelay, [], [], deployer.address);
    await timelock.waitForDeployment();
    console.log("✓ TimelockController deployed to:", timelock.target);
    
    // Deploy governance components
    console.log("Deploying ProposalMetadataManager...");
    const MetadataManager = await ethers.getContractFactory("governance/ProposalMetadataManager");
    const metadataManager = await MetadataManager.deploy();
    await metadataManager.waitForDeployment();
    console.log("✓ ProposalMetadataManager deployed to:", metadataManager.target);
    
    console.log("Deploying Guardian...");
    const Guardian = await ethers.getContractFactory("governance/Guardian");
    const guardian = await Guardian.deploy();
    await guardian.waitForDeployment();
    console.log("✓ Guardian deployed to:", guardian.target);
    
    console.log("Deploying VotingEngine...");
    const VotingEngine = await ethers.getContractFactory("governance/VotingEngine");
    const votingEngine = await VotingEngine.deploy();
    await votingEngine.waitForDeployment();
    console.log("✓ VotingEngine deployed to:", votingEngine.target);
    
    console.log("Deploying ProposalExecutor...");
    const ProposalExecutor = await ethers.getContractFactory("governance/ProposalExecutor");
    const proposalExecutor = await ProposalExecutor.deploy(timelock.target);
    await proposalExecutor.waitForDeployment();
    console.log("✓ ProposalExecutor deployed to:", proposalExecutor.target);
    
    // Deploy ModularGovernor
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
    console.log("✓ ModularGovernor deployed to:", governor.target);
    
    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n=== DEPLOYED CONTRACTS ===");
    console.log("GovernanceToken:", token.target);
    console.log("TimelockController:", timelock.target);
    console.log("ProposalMetadataManager:", metadataManager.target);
    console.log("Guardian:", guardian.target);
    console.log("VotingEngine:", votingEngine.target);
    console.log("ProposalExecutor:", proposalExecutor.target);
    console.log("ModularGovernor:", governor.target);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });