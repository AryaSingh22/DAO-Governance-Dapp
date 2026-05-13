import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("ReputationManager", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployReputationManagerFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const ReputationManager = await hre.ethers.getContractFactory("ReputationManager");
    const reputationManager = await ReputationManager.deploy(
      "ResearchDAO Reputation",
      "RDR",
      "ipfs://reputation/"
    );

    const REPUTATION_MANAGER_ROLE = await reputationManager.REPUTATION_MANAGER_ROLE();
    await reputationManager.grantRole(REPUTATION_MANAGER_ROLE, owner.address);

    return { reputationManager, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { reputationManager } = await loadFixture(deployReputationManagerFixture);

      expect(await reputationManager.name()).to.equal("ResearchDAO Reputation");
      expect(await reputationManager.symbol()).to.equal("RDR");
    });

    it("Should create default badge tiers", async function () {
      const { reputationManager } = await loadFixture(deployReputationManagerFixture);

      // Check that default badges exist
      const researcherBadge = await reputationManager.getBadgeDetails(1);
      expect(researcherBadge[0]).to.equal("Researcher");
      expect(researcherBadge[2]).to.equal(100n);

      const contributorBadge = await reputationManager.getBadgeDetails(2);
      expect(contributorBadge[0]).to.equal("Contributor");
      expect(contributorBadge[2]).to.equal(500n);

      const expertBadge = await reputationManager.getBadgeDetails(3);
      expect(expertBadge[0]).to.equal("Expert");
      expect(expertBadge[2]).to.equal(1000n);

      const visionaryBadge = await reputationManager.getBadgeDetails(4);
      expect(visionaryBadge[0]).to.equal("Visionary");
      expect(visionaryBadge[2]).to.equal(2000n);
    });
  });

  describe("Badge Management", function () {
    it("Should allow owner to create new badge tiers", async function () {
      const { reputationManager, owner } = await loadFixture(deployReputationManagerFixture);

      const badgeName = "Innovator";
      const badgeDescription = "Innovative contributor";
      const pointsRequired = 1500;
      const tokenURI = "ipfs://innovator.json";

      await expect(reputationManager.connect(owner).createBadgeTier(
        badgeName,
        badgeDescription,
        pointsRequired,
        tokenURI
      )).to.emit(reputationManager, "BadgeTierCreated")
        .withArgs(5, badgeName, pointsRequired);

      const badge = await reputationManager.getBadgeDetails(5);
      expect(badge[0]).to.equal(badgeName);
      expect(badge[1]).to.equal(badgeDescription);
      expect(badge[2]).to.equal(pointsRequired);
      expect(badge[3]).to.equal(tokenURI);
    });

    it("Should fail if non-owner tries to create badge tier", async function () {
      const { reputationManager, addr1 } = await loadFixture(deployReputationManagerFixture);

      await expect(reputationManager.connect(addr1).createBadgeTier(
        "Test Badge",
        "Test Description",
        100,
        "ipfs://test.json"
      )).to.be.revertedWithCustomError(reputationManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reputation Points", function () {
    it("Should allow owner to add points to user", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      const points = 50;
      const reason = "Paper submission";

      await expect(reputationManager.connect(owner).addPoints(addr1.address, points, reason))
        .to.emit(reputationManager, "PointsAdded")
        .withArgs(addr1.address, points, reason);

      const reputation = await reputationManager.getUserReputation(addr1.address);
      expect(reputation[0]).to.equal(points); // totalPoints is the first return value
    });

    it("Should fail if non-owner tries to add points", async function () {
      const { reputationManager, addr1, addr2 } = await loadFixture(deployReputationManagerFixture);

      await expect(reputationManager.connect(addr1).addPoints(addr2.address, 50, "Test"))
        .to.be.revertedWithCustomError(reputationManager, "AccessControlUnauthorizedAccount");
    });

    it("Should award badges when points threshold is reached", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      // Add enough points to earn the Researcher badge (100 points)
      await reputationManager.connect(owner).addPoints(addr1.address, 100, "Paper submission");

      // Check that user has the Researcher badge
      const badges = await reputationManager.getUserBadges(addr1.address);
      expect(badges.length).to.equal(1);
      expect(badges[0]).to.equal(1n); // Researcher badge ID

      // Check that the badge was awarded
      await expect(reputationManager.ownerOf(1)).to.eventually.equal(addr1.address);
    });

    it("Should handle multiple badge awards", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      // Add enough points to earn multiple badges
      await reputationManager.connect(owner).addPoints(addr1.address, 500, "Contributions");

      // Check that user has the appropriate badges
      const badges = await reputationManager.getUserBadges(addr1.address);
      expect(badges.length).to.equal(2);
      expect(badges).to.deep.equal([1n, 2n]); // Researcher and Contributor badges
    });
  });

  describe("Specialized Point Functions", function () {
    it("Should add submission points correctly", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      await reputationManager.connect(owner).addSubmissionPoints(addr1.address);

      const reputation = await reputationManager.getUserReputation(addr1.address);
      expect(reputation[0]).to.equal(50); // totalPoints is the first return value
      expect(reputation[1]).to.equal(1); // submissions is the second return value
    });

    it("Should add voting points correctly", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      await reputationManager.connect(owner).addVotingPoints(addr1.address);

      const reputation = await reputationManager.getUserReputation(addr1.address);
      expect(reputation[0]).to.equal(10); // totalPoints is the first return value
      expect(reputation[2]).to.equal(1); // votes is the third return value
    });

    it("Should add review points correctly", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      await reputationManager.connect(owner).addReviewPoints(addr1.address);

      const reputation = await reputationManager.getUserReputation(addr1.address);
      expect(reputation[0]).to.equal(25); // totalPoints is the first return value
      expect(reputation[3]).to.equal(1); // reviews is the fourth return value
    });
  });

  describe("View Functions", function () {
    it("Should return correct user reputation data", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      // Add various types of points
      await reputationManager.connect(owner).addSubmissionPoints(addr1.address);
      await reputationManager.connect(owner).addVotingPoints(addr1.address);
      await reputationManager.connect(owner).addReviewPoints(addr1.address);

      const reputation = await reputationManager.getUserReputation(addr1.address);
      expect(reputation[0]).to.equal(85); // totalPoints: 50 + 10 + 25
      expect(reputation[1]).to.equal(1); // submissions
      expect(reputation[2]).to.equal(1); // votes
      expect(reputation[3]).to.equal(1); // reviews
    });

    it("Should return user badges", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      // Earn a badge
      await reputationManager.connect(owner).addPoints(addr1.address, 100, "Achievement");

      const badges = await reputationManager.getUserBadges(addr1.address);
      expect(badges.length).to.equal(1);
      expect(badges[0]).to.equal(1n);
    });

    it("Should return badge details", async function () {
      const { reputationManager } = await loadFixture(deployReputationManagerFixture);

      const badge = await reputationManager.getBadgeDetails(1);
      expect(badge[0]).to.equal("Researcher");
      expect(badge[1]).to.equal("Submitted first research paper");
      expect(badge[2]).to.equal(100n);
      expect(badge[3]).to.equal("researcher.json");
    });
  });

  describe("Edge Cases and Advanced Interaction", function () {
    it("Should correctly manage nextBadgeIdToCheck across multiple point additions", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      // Add 100 points -> Earns badge 1 (Researcher)
      await reputationManager.connect(owner).addPoints(addr1.address, 100, "Initial");
      expect((await reputationManager.getUserBadges(addr1.address)).length).to.equal(1);

      // nextBadgeIdToCheck for addr1 should now be 2 (since 100 < 500 for tier 2)
      expect(await reputationManager.nextBadgeIdToCheck(addr1.address)).to.equal(2n);

      // Add another 400 points -> Earns badge 2 (Contributor)
      await reputationManager.connect(owner).addPoints(addr1.address, 400, "Followup");
      const badges = await reputationManager.getUserBadges(addr1.address);
      expect(badges.length).to.equal(2);
      expect(badges[1]).to.equal(2n); // Won badge ID 2

      // nextBadgeIdToCheck should now be 3
      expect(await reputationManager.nextBadgeIdToCheck(addr1.address)).to.equal(3n);
    });

    it("Should stop checking for badges if points requirement is not met", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);
      // Tier 1 is 100. Let's add 50.
      await reputationManager.connect(owner).addPoints(addr1.address, 50, "Partial points");

      // No badges
      const badges = await reputationManager.getUserBadges(addr1.address);
      expect(badges.length).to.equal(0);

      // nextBadgeIdToCheck should be stuck at 1
      expect(await reputationManager.nextBadgeIdToCheck(addr1.address)).to.equal(1n);
    });

    it("Should handle unordered custom badge creation by skipping unreachable tiers", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      // Create a badge that is very expensive (Badge 5)
      await reputationManager.connect(owner).createBadgeTier("Impossible", "Too hard", 10000, "ipfs://impl.json");

      // Create a badge that is easy (Badge 6)
      await reputationManager.connect(owner).createBadgeTier("Easy", "Very easy", 50, "ipfs://easy.json");

      // Give 50 points. This is enough for Badge 6 but NOT Badge 5.
      // Because the loop stops at the first un-affordable badge (Badge 1 = 100), it won't even reach Badge 6!
      await reputationManager.connect(owner).addPoints(addr1.address, 50, "Give 50");
      expect((await reputationManager.getUserBadges(addr1.address)).length).to.equal(0);
    });
  });

  describe("Access Control and Admin", function () {
    it("Should allow granting REPUTATION_MANAGER_ROLE to another account", async function () {
      const { reputationManager, owner, addr1, addr2 } = await loadFixture(deployReputationManagerFixture);

      const REPUTATION_MANAGER_ROLE = await reputationManager.REPUTATION_MANAGER_ROLE();

      // Grant to addr1
      await reputationManager.connect(owner).grantRole(REPUTATION_MANAGER_ROLE, addr1.address);

      // addr1 should now be able to add points
      await expect(reputationManager.connect(addr1).addPoints(addr2.address, 10, "Test"))
        .to.not.be.reverted;

      const rep = await reputationManager.getUserReputation(addr2.address);
      expect(rep[0]).to.equal(10n);
    });

    it("Should allow a user to renounce their own REPUTATION_MANAGER_ROLE", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);

      const REPUTATION_MANAGER_ROLE = await reputationManager.REPUTATION_MANAGER_ROLE();
      await reputationManager.connect(owner).grantRole(REPUTATION_MANAGER_ROLE, addr1.address);

      // addr1 renounces
      await reputationManager.connect(addr1).renounceRole(REPUTATION_MANAGER_ROLE, addr1.address);

      await expect(reputationManager.connect(addr1).addPoints(owner.address, 10, "Test"))
        .to.be.revertedWithCustomError(reputationManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Miscellaneous and Overrides", function () {
    it("Should return properly constructed empty array for getLeaderboard", async function () {
      const { reputationManager } = await loadFixture(deployReputationManagerFixture);

      const leaderboard = await reputationManager.getLeaderboard(5);
      expect(leaderboard.length).to.equal(5);
      expect(leaderboard[0]).to.equal(hre.ethers.ZeroAddress);
    });

    it("Should support ERC721 and AccessControl interfaces via supportsInterface", async function () {
      const { reputationManager } = await loadFixture(deployReputationManagerFixture);

      // 0x80ac58cd = ERC721
      expect(await reputationManager.supportsInterface("0x80ac58cd")).to.be.true;

      // 0x7965db0b = AccessControl
      expect(await reputationManager.supportsInterface("0x7965db0b")).to.be.true;

      // 0x00000000 = Invalid interface
      expect(await reputationManager.supportsInterface("0xffffffff")).to.be.false;
    });

    it("Should return correct baseTokenURI string when queried", async function () {
      const { reputationManager } = await loadFixture(deployReputationManagerFixture);
      expect(await reputationManager.baseTokenURI()).to.equal("ipfs://reputation/");
    });

    it("Should allow transfer of badges between users since Standard ERC721 is used", async function () {
      const { reputationManager, owner, addr1, addr2 } = await loadFixture(deployReputationManagerFixture);

      // Earn badge
      await reputationManager.connect(owner).addPoints(addr1.address, 100, "Achievement");

      // User addr1 earned Badge 1, mapping to tokenId 1
      expect(await reputationManager.ownerOf(1n)).to.equal(addr1.address);

      // Transfer badge to addr2
      await reputationManager.connect(addr1).transferFrom(addr1.address, addr2.address, 1n);

      expect(await reputationManager.ownerOf(1n)).to.equal(addr2.address);
    });

    it("Should return correct tokenURI properly forming base and token", async function () {
      const { reputationManager, owner, addr1 } = await loadFixture(deployReputationManagerFixture);
      await reputationManager.connect(owner).addPoints(addr1.address, 100, "Achievement");
      expect(await reputationManager.tokenURI(1n)).to.equal("ipfs://reputation/researcher.json");
    });
  });
});
