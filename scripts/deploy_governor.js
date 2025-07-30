// scripts/deploy_governor.js
const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed GovernanceToken address:
  const governanceTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const MyGovernor = await ethers.getContractFactory("MyGovernor");
  const governor = await MyGovernor.deploy(governanceTokenAddress);
  await governor.waitForDeployment();

  console.log("MyGovernor deployed to:", await governor.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 