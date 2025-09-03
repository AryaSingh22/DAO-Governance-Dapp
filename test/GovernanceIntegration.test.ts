import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("Governance Integration", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployGovernanceFixture() {
    // Get signers
    const [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();
    
    // Deploy GovernanceToken
    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy();
    
    // Mint tokens to participants
    const mintAmount = hre.ethers.parseEther("1000");
    await token.mint(owner.address, mintAmount);
    await token.mint(addr1.address, mintAmount);
    await token.mint(addr2.address, mintAmount);
    
    // Deploy Timelock
    const minDelay = 3600; // 1 hour
    const Timelock = await hre.ethers.getContractFactory("TimelockController");
    const timelock = await Timelock.deploy(minDelay, [], [], owner.address);
    
    // Deploy Governor
    const votingDelay = 1; // 1 block
    const votingPeriod = 20; // 20 blocks
    const proposalThreshold = hre.ethers.parseEther("1");
    const quorumPercent = 4;
    
    const Governor = await hre.ethers.getContractFactory("MyGovernor");
    const governor = await Governor.deploy(
      token.target,
      timelock.target,
      votingDelay,
      votingPeriod,
      proposalThreshold,
      quorumPercent
    );
    
    // Deploy Treasury
    const Treasury = await hre.ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy(owner.address); // Deploy with owner as initial owner
    
    // Deploy MembershipNFT
    const MembershipNFT = await hre.ethers.getContractFactory("MembershipNFT");
    const membershipNFT = await MembershipNFT.deploy(
      "DAO Membership",
      "DAO",
      "https://ipfs.io/ipfs/",
      0, // mintPrice
      1000 // maxSupply
    );
    
    // Setup roles
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    
    // Grant proposer role to governor
    await timelock.grantRole(PROPOSER_ROLE, governor.target);
    
    // Allow anyone to execute by giving executor role to address(0)
    await timelock.grantRole(EXECUTOR_ROLE, hre.ethers.ZeroAddress);
    
    // Set Guardian roles BEFORE transferring ownership
    await treasury.setGuardian(governor.target);
    await governor.setGuardian(owner.address); // Set deployer as guardian initially
    
    // Transfer ownership of Treasury and Membership NFT to Timelock
    await treasury.transferOwnership(timelock.target);
    await membershipNFT.transferOwnership(timelock.target);
    
    return { 
      token, 
      timelock, 
      governor, 
      treasury, 
      membershipNFT,
      owner, 
      addr1, 
      addr2, 
      addr3,
      minDelay,
      votingDelay,
      votingPeriod,
      proposalThreshold,
      quorumPercent
    };
  }

  describe("Full Governance Flow", function () {
    it("Should execute complete governance flow: proposal -> voting -> queuing -> execution", async function () {
      const { 
        token, 
        timelock, 
        governor, 
        treasury, 
        owner, 
        addr1, 
        addr2 
      } = await loadFixture(deployGovernanceFixture);
      
      // Step 1: Delegate voting power
      await token.delegate(owner.address);
      await token.connect(addr1).delegate(addr1.address);
      await token.connect(addr2).delegate(addr2.address);
      
      // Step 2: Fund treasury with ETH
      const fundAmount = hre.ethers.parseEther("10");
      await owner.sendTransaction({
        to: treasury.target,
        value: fundAmount
      });
      
      expect(await hre.ethers.provider.getBalance(treasury.target)).to.equal(fundAmount);
      
      // Step 3: Create proposal to release ETH from treasury
      const targets = [treasury.target];
      const values = [0n];
      const calldata = treasury.interface.encodeFunctionData("releaseETH", [
        addr1.address,
        hre.ethers.parseEther("1")
      ]);
      const description = "Release 1 ETH to addr1";
      
      // Create proposal
      const proposeTx = await governor.propose(
        targets,
        values,
        [calldata],
        description
      );
      
      const proposeReceipt = await proposeTx.wait();
      if (!proposeReceipt) {
        throw new Error("Failed to get proposal receipt");
      }
      const proposalId = (proposeReceipt.logs[0] as any).args.proposalId;
      
      // Move past voting delay
      await time.advanceBlock();
      await time.advanceBlock();
      
      // Step 4: Vote on proposal
      await governor.castVote(proposalId, 1); // Vote for (1 = for, 0 = against, 2 = abstain)
      await governor.connect(addr1).castVote(proposalId, 1);
      await governor.connect(addr2).castVote(proposalId, 1);
      
      // Move past voting period
      // Voting period is 20 blocks, so we need to advance more blocks
      for (let i = 0; i < 25; i++) {
        await time.advanceBlock();
      }
      
      // Check proposal state
      const state = await governor.state(proposalId);
      expect(state).to.equal(4n); // 4 = Succeeded
      
      // Step 5: Queue proposal
      const descriptionHash = hre.ethers.id(description);
      await governor.queue(targets, values, [calldata], descriptionHash);
      
      // Check proposal state
      const queuedState = await governor.state(proposalId);
      expect(queuedState).to.equal(5n); // 5 = Queued
      
      // Move past timelock delay
      await time.increase(3601); // 1 hour + 1 second
      
      // Step 6: Execute proposal
      const initialBalance = await hre.ethers.provider.getBalance(addr1.address);
      await governor.execute(targets, values, [calldata], descriptionHash);
      
      // Check proposal state
      const executedState = await governor.state(proposalId);
      expect(executedState).to.equal(7n); // 7 = Executed
      
      // Check that ETH was transferred
      const finalBalance = await hre.ethers.provider.getBalance(addr1.address);
      expect(finalBalance).to.be.above(initialBalance);
    });
    
    it("Should handle proposal with metadata", async function () {
      const { 
        token, 
        governor, 
        owner, 
        addr1 
      } = await loadFixture(deployGovernanceFixture);
      
      // Delegate voting power
      await token.delegate(owner.address);
      await token.connect(addr1).delegate(addr1.address);
      
      // Create proposal with metadata
      const targets = [governor.target];
      const values = [0n];
      const calldata = governor.interface.encodeFunctionData("setGuardian", [addr1.address]);
      const title = "Set new guardian";
      const description = "Set addr1 as the new guardian";
      const ipfsCID = "QmExampleCID";
      const category = 1; // Protocol category
      
      // Create proposal with metadata
      const proposeTx = await (governor as any).proposeWithMetadata(
        targets,
        values,
        [calldata],
        title,
        description,
        ipfsCID,
        category
      );
      
      const proposeReceipt = await proposeTx.wait();
      if (!proposeReceipt) {
        throw new Error("Failed to get proposal receipt");
      }
      const proposalId = (proposeReceipt.logs[0] as any).args.proposalId;
      
      // Check metadata was stored
      const metadata = await governor.getProposalMetadata(proposalId);
      expect(metadata.title).to.equal(title);
      expect(metadata.description).to.equal(description);
      expect(metadata.ipfsCID).to.equal(ipfsCID);
      expect(metadata.category).to.equal(category);
    });
  });
  
  describe("Emergency Controls", function () {
    it("Should allow guardian to cancel active proposal", async function () {
      const { 
        token, 
        governor, 
        owner, 
        addr1 
      } = await loadFixture(deployGovernanceFixture);
      
      // Delegate voting power
      await token.delegate(owner.address);
      
      // Create proposal
      const targets = [governor.target];
      const values = [0n];
      const calldata = governor.interface.encodeFunctionData("setGuardian", [addr1.address]);
      const description = "Set new guardian";
      
      const proposeTx = await governor.propose(
        targets,
        values,
        [calldata],
        description
      );
      
      const proposeReceipt = await proposeTx.wait();
      if (!proposeReceipt) {
        throw new Error("Failed to get proposal receipt");
      }
      const proposalId = (proposeReceipt.logs[0] as any).args.proposalId;
      
      // Move past voting delay
      await time.advanceBlock();
      await time.advanceBlock();
      
      // Guardian cancels proposal
      await governor.emergencyCancelProposal(proposalId, "Security concern");
      
      // Check proposal is canceled
      const state = await governor.state(proposalId);
      expect(state).to.equal(2n); // 2 = Canceled
      
      // Verify it was canceled by guardian
      expect(await governor.isProposalCanceled(proposalId)).to.be.true;
    });
  });
});