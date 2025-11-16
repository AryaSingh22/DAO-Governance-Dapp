import { ethers } from "hardhat";

async function main() {
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deployment parameters
  const timelockDelay = 86400; // 24 hours

  console.log("\n=== STEP 1: Deploying GovernanceToken ===");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const token = await GovernanceToken.deploy();
  await token.waitForDeployment();
  console.log("GovernanceToken deployed to:", token.target);

  console.log("\n=== STEP 2: Deploying TimelockController ===");
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(timelockDelay, [], [], deployer.address);
  await timelock.waitForDeployment();
  console.log("TimelockController deployed to:", timelock.target);

  console.log("\n=== STEP 3: Deploying MyGovernorStreamlined ===");
  const votingDelay = 1; // 1 block
  const votingPeriod = 600; // ~10 minutes on testnet (1 block = 1 second)
  const proposalThreshold = ethers.parseEther("1"); // 1 token
  const quorumPercent = 4; // 4%
  
  const Governor = await ethers.getContractFactory("MyGovernorStreamlined");
  const governor = await Governor.deploy(
    token.target,
    timelock.target,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercent
  );
  await governor.waitForDeployment();
  console.log("MyGovernorStreamlined deployed to:", governor.target);

  console.log("\n=== STEP 4: Deploying Treasury ===");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(timelock.target);
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", treasury.target);

  console.log("\n=== STEP 5: Deploying MembershipNFT ===");
  const mintPrice = 0; // Free minting
  const maxSupply = 10000; // 10,000 memberships
  
  const MembershipNFT = await ethers.getContractFactory("MembershipNFT");
  const membershipNFT = await MembershipNFT.deploy(
    "DAO Membership",
    "DAO",
    "https://ipfs.io/ipfs/",
    mintPrice,
    maxSupply
  );
  await membershipNFT.waitForDeployment();
  console.log("MembershipNFT deployed to:", membershipNFT.target);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n=== CONTRACT ADDRESSES ===");
  console.log("GovernanceToken:", token.target);
  console.log("TimelockController:", timelock.target);
  console.log("MyGovernorStreamlined:", governor.target);
  console.log("Treasury:", treasury.target);
  console.log("MembershipNFT:", membershipNFT.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });