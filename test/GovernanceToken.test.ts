import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("GovernanceToken", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployGovernanceTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy();

    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { token } = await loadFixture(deployGovernanceTokenFixture);

      expect(await token.name()).to.equal("Governance Token");
      expect(await token.symbol()).to.equal("TDT");
    });

    it("Should have correct decimals", async function () {
      const { token } = await loadFixture(deployGovernanceTokenFixture);

      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployGovernanceTokenFixture);
      
      const mintAmount = hre.ethers.parseEther("1000");
      await token.mint(addr1.address, mintAmount);
      
      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await token.totalSupply()).to.equal(mintAmount * 2n); // 1000 initial + 1000 minted
    });

    it("Should fail when non-owner tries to mint", async function () {
      const { token, addr1 } = await loadFixture(deployGovernanceTokenFixture);
      
      const mintAmount = hre.ethers.parseEther("1000");
      await expect(token.connect(addr1).mint(addr1.address, mintAmount))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Delegation", function () {
    it("Should allow delegation of voting power", async function () {
      const { token, owner, addr1 } = await loadFixture(deployGovernanceTokenFixture);
      
      // Mint tokens to owner
      const mintAmount = hre.ethers.parseEther("1000");
      await token.mint(owner.address, mintAmount);
      
      // Delegate to addr1
      await token.delegate(addr1.address);
      
      expect(await token.delegates(owner.address)).to.equal(addr1.address);
    });

    it("Should allow self-delegation", async function () {
      const { token, owner } = await loadFixture(deployGovernanceTokenFixture);
      
      // Mint tokens to owner
      const mintAmount = hre.ethers.parseEther("1000");
      await token.mint(owner.address, mintAmount);
      
      // Delegate to self
      await token.delegate(owner.address);
      
      expect(await token.delegates(owner.address)).to.equal(owner.address);
    });
  });

  describe("Voting Power", function () {
    it("Should correctly calculate voting power after delegation", async function () {
      const { token, owner, addr1 } = await loadFixture(deployGovernanceTokenFixture);
      
      // Mint tokens to owner
      const mintAmount = hre.ethers.parseEther("1000");
      await token.mint(owner.address, mintAmount);
      
      // Check initial voting power
      expect(await token.getVotes(owner.address)).to.equal(0);
      
      // Delegate voting power
      await token.delegate(owner.address);
      
      // Check voting power after delegation (1000 initial + 1000 minted)
      expect(await token.getVotes(owner.address)).to.equal(mintAmount * 2n);
    });

    it("Should handle voting power snapshots correctly", async function () {
      const { token, owner, addr1 } = await loadFixture(deployGovernanceTokenFixture);
      
      // Mint tokens to owner
      const mintAmount = hre.ethers.parseEther("1000");
      await token.mint(owner.address, mintAmount);
      
      // Delegate voting power
      await token.delegate(owner.address);
      
      // Take snapshot
      const blockNumber = await time.latestBlock();
      
      // Mint more tokens
      await token.mint(owner.address, mintAmount);
      
      // Check current voting power (1000 initial + 1000 minted + 1000 minted)
      expect(await token.getVotes(owner.address)).to.equal(mintAmount * 3n);
      
      // Check past voting power (1000 initial + 1000 minted)
      expect(await token.getPastVotes(owner.address, blockNumber)).to.equal(mintAmount * 2n);
    });
  });

  describe("Permit Functionality", function () {
    it("Should allow permit functionality for gasless approvals", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployGovernanceTokenFixture);
      
      // Mint tokens to owner
      const mintAmount = hre.ethers.parseEther("1000");
      await token.mint(owner.address, mintAmount);
      
      // Create permit signature
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const nonce = await token.nonces(owner.address);
      const value = hre.ethers.parseEther("100");
      
      // Create the permit message
      const domain = {
        name: await token.name(),
        version: "1",
        chainId: (await hre.ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };
      
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      
      const message = {
        owner: owner.address,
        spender: addr1.address,
        value: value,
        nonce: nonce,
        deadline: deadline,
      };
      
      // Sign the permit
      const signature = await owner.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);
      
      // Execute permit
      await token.permit(owner.address, addr1.address, value, deadline, v, r, s);
      
      // Check allowance
      expect(await token.allowance(owner.address, addr1.address)).to.equal(value);
    });
  });
});