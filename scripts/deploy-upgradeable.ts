import { ethers, upgrades } from "hardhat";    

async function main() {    
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying upgradeable contracts with the account:", deployer.address);     
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deployment parameters
  const votingDelay = 1; // 1 block
  const votingPeriod = 600; // ~10 minutes on testnet (1 block = 1 second)
  const proposalThreshold = ethers.parseEther("1"); // 1 token
  const quorumPercent = 4; // 4%
  const timelockDelay = 86400; // 24 hours
  const mintPrice = 0; // Free minting
  const maxSupply = 10000; // 10,000 memberships

  console.log("Deploying GovernanceTokenUpgradeable...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceTokenUpgradeable");
  const token = await upgrades.deployProxy(GovernanceToken, [], { initializer: 'initialize' });
  await token.waitForDeployment();
  const tokenImplementation = await upgrades.erc1967.getImplementationAddress(await token.getAddress());
  console.log("GovernanceTokenUpgradeable deployed to:", await token.getAddress());
  console.log("GovernanceTokenUpgradeable implementation at:", tokenImplementation);

  console.log("Deploying TimelockController...");
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(timelockDelay, [], [], deployer.address);
  await timelock.waitForDeployment();
  console.log("TimelockController deployed to:", timelock.target);

  console.log("Deploying MyGovernorUpgradeable...");
  const Governor = await ethers.getContractFactory("MyGovernorUpgradeable");
  const governor = await upgrades.deployProxy(Governor, [
    token.target,
    timelock.target,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercent
  ], { initializer: 'initialize' });
  await governor.waitForDeployment();
  const governorImplementation = await upgrades.erc1967.getImplementationAddress(await governor.getAddress());
  console.log("MyGovernorUpgradeable deployed to:", await governor.getAddress());
  console.log("MyGovernorUpgradeable implementation at:", governorImplementation);

  // For Treasury and MembershipNFT, we'll keep them as regular contracts for now
  // since they don't need frequent upgrades
  console.log("Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(timelock.target);
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", treasury.target);

  console.log("Deploying MembershipNFT...");
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

  await governor.setGuardian(deployer.address);
  console.log("Set Governor guardian to deployer");

  // Save contract addresses
  console.log("\n=== CONTRACT ADDRESSES ===");
  console.log("GovernanceToken Proxy:", token.target);
  console.log("GovernanceToken Implementation:", tokenImplementation);
  console.log("TimelockController:", timelock.target);
  console.log("MyGovernor Proxy:", governor.target);
  console.log("MyGovernor Implementation:", governorImplementation);
  console.log("Treasury:", treasury.target);
  console.log("MembershipNFT:", membershipNFT.target);

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
