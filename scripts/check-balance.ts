import { ethers } from "hardhat";

async function main() {
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Checking balance for account:", deployer.address);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });