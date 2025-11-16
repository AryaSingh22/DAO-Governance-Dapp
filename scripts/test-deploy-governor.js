const { ethers } = require("hardhat");

async function main() {
  console.log("Testing deployment of MyGovernorStreamlined...");
  
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy a simple token for testing
  console.log("Deploying simple token...");
  const SimpleToken = await ethers.getContractFactory("GovernanceToken");
  const token = await SimpleToken.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", token.target);
  
  // Deploy timelock
  console.log("Deploying timelock...");
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(86400, [], [], deployer.address);
  await timelock.waitForDeployment();
  console.log("Timelock deployed to:", timelock.target);
  
  // Try to deploy the streamlined governor
  console.log("Deploying MyGovernorStreamlined...");
  try {
    const Governor = await ethers.getContractFactory("MyGovernorStreamlined");
    const governor = await Governor.deploy(
      token.target,
      timelock.target,
      1,      // votingDelay
      600,    // votingPeriod
      ethers.parseEther("1"), // proposalThreshold
      4       // quorumPercent
    );
    await governor.waitForDeployment();
    console.log("MyGovernorStreamlined deployed successfully to:", governor.target);
  } catch (error) {
    console.error("Failed to deploy MyGovernorStreamlined:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });