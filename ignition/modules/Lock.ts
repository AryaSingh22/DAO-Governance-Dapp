import { ethers } from "hardhat";

async function main() {
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  
  // deploy() now waits for the contract to be deployed.
  const governanceToken = await GovernanceToken.deploy();

  // We no longer need to call .deployed()
  // await governanceToken.deployed(); // <--- DELETE THIS LINE

  console.log(
    `GovernanceToken deployed to: ${await governanceToken.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});