import { ethers, upgrades } from "hardhat";

// Update with your proxy contract addresses
const PROXY_ADDRESSES = {
  GovernanceToken: "YOUR_GOVERNANCE_TOKEN_PROXY_ADDRESS",
  MyGovernor: "YOUR_GOVERNOR_PROXY_ADDRESS"
};

async function main() {
  console.log("Preparing contract upgrades...");

  // Upgrade GovernanceToken
  console.log("Upgrading GovernanceToken...");
  const GovernanceTokenV2 = await ethers.getContractFactory("GovernanceTokenUpgradeable");
  const upgradedToken = await upgrades.upgradeProxy(
    PROXY_ADDRESSES.GovernanceToken,
    GovernanceTokenV2
  );
  await upgradedToken.waitForDeployment();
  
  const newTokenImplementation = await upgrades.erc1967.getImplementationAddress(await upgradedToken.getAddress());
  console.log("GovernanceToken upgraded successfully!");
  console.log("New implementation address:", newTokenImplementation);

  // Upgrade MyGovernor
  console.log("Upgrading MyGovernor...");
  const GovernorV2 = await ethers.getContractFactory("MyGovernorUpgradeable");
  const upgradedGovernor = await upgrades.upgradeProxy(
    PROXY_ADDRESSES.MyGovernor,
    GovernorV2
  );
  await upgradedGovernor.waitForDeployment();
  
  const newGovernorImplementation = await upgrades.erc1967.getImplementationAddress(await upgradedGovernor.getAddress());
  console.log("MyGovernor upgraded successfully!");
  console.log("New implementation address:", newGovernorImplementation);

  console.log("\nUpgrade process completed!");
  console.log("IMPORTANT: Verify that the upgrade was successful by testing contract functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });