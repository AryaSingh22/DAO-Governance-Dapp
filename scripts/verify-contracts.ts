import { ethers, run } from "hardhat";

// Contract addresses - update these with your deployed addresses
const CONTRACT_ADDRESSES = {
  GovernanceToken: "YOUR_GOVERNANCE_TOKEN_ADDRESS",
  TimelockController: "YOUR_TIMELOCK_ADDRESS",
  MyGovernor: "YOUR_GOVERNOR_ADDRESS",
  Treasury: "YOUR_TREASURY_ADDRESS",
  MembershipNFT: "YOUR_MEMBERSHIP_NFT_ADDRESS"
};

// Deployment parameters - update these with your deployment parameters
const DEPLOYMENT_PARAMS = {
  timelockDelay: 86400, // 24 hours
  votingDelay: 1,
  votingPeriod: 600, // ~10 minutes
  proposalThreshold: ethers.parseEther("1"),
  quorumPercent: 4,
  mintPrice: 0,
  maxSupply: 10000,
  name: "DAO Membership",
  symbol: "DAO",
  baseURI: "https://ipfs.io/ipfs/"
};

async function main() {
  console.log("Verifying contracts on Etherscan...");

  try {
    // Verify GovernanceToken
    console.log("Verifying GovernanceToken...");
    await run("verify:verify", {
      address: CONTRACT_ADDRESSES.GovernanceToken,
      constructorArguments: [],
    });
    console.log("✓ GovernanceToken verified");
  } catch (error: any) {
    console.log("Error verifying GovernanceToken:", error.message);
  }

  try {
    // Verify TimelockController
    console.log("Verifying TimelockController...");
    await run("verify:verify", {
      address: CONTRACT_ADDRESSES.TimelockController,
      constructorArguments: [
        DEPLOYMENT_PARAMS.timelockDelay,
        [], // proposers
        [], // executors
        (await ethers.getSigners())[0].address // admin
      ],
    });
    console.log("✓ TimelockController verified");
  } catch (error: any) {
    console.log("Error verifying TimelockController:", error.message);
  }

  try {
    // Verify MyGovernor
    console.log("Verifying MyGovernor...");
    await run("verify:verify", {
      address: CONTRACT_ADDRESSES.MyGovernor,
      constructorArguments: [
        CONTRACT_ADDRESSES.GovernanceToken,
        CONTRACT_ADDRESSES.TimelockController,
        DEPLOYMENT_PARAMS.votingDelay,
        DEPLOYMENT_PARAMS.votingPeriod,
        DEPLOYMENT_PARAMS.proposalThreshold,
        DEPLOYMENT_PARAMS.quorumPercent
      ],
    });
    console.log("✓ MyGovernor verified");
  } catch (error: any) {
    console.log("Error verifying MyGovernor:", error.message);
  }

  try {
    // Verify Treasury
    console.log("Verifying Treasury...");
    await run("verify:verify", {
      address: CONTRACT_ADDRESSES.Treasury,
      constructorArguments: [CONTRACT_ADDRESSES.TimelockController],
    });
    console.log("✓ Treasury verified");
  } catch (error: any) {
    console.log("Error verifying Treasury:", error.message);
  }

  try {
    // Verify MembershipNFT
    console.log("Verifying MembershipNFT...");
    await run("verify:verify", {
      address: CONTRACT_ADDRESSES.MembershipNFT,
      constructorArguments: [
        DEPLOYMENT_PARAMS.name,
        DEPLOYMENT_PARAMS.symbol,
        DEPLOYMENT_PARAMS.baseURI,
        DEPLOYMENT_PARAMS.mintPrice,
        DEPLOYMENT_PARAMS.maxSupply
      ],
    });
    console.log("✓ MembershipNFT verified");
  } catch (error: any) {
    console.log("Error verifying MembershipNFT:", error.message);
  }

  console.log("\nVerification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });