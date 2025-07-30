// scripts/deploy_token.js
const { ethers } = require("hardhat");

async function main() {
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const token = await GovernanceToken.deploy();
  await token.waitForDeployment();

  console.log("GovernanceToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 