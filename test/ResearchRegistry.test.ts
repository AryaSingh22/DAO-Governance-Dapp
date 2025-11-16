import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("ResearchRegistry", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployResearchRegistryFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    // Deploy a mock ERC20 token for submission fees
    const MockToken = await hre.ethers.getContractFactory("GovernanceToken");
    const mockToken = await MockToken.deploy();
    
    // Mint some tokens to addr1 for testing
    const mintAmount = hre.ethers.parseEther("1000");
    await mockToken.mint(addr1.address, mintAmount);
    await mockToken.mint(addr2.address, mintAmount);

    const ResearchRegistry = await hre.ethers.getContractFactory("ResearchRegistry");
    const submissionFee = hre.ethers.parseEther("10");
    const researchRegistry = await ResearchRegistry.deploy(
      await mockToken.getAddress(),
      submissionFee
    );

    return { researchRegistry, mockToken, owner, addr1, addr2, submissionFee };
  }

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      const { researchRegistry, mockToken, submissionFee } = await loadFixture(deployResearchRegistryFixture);

      expect(await researchRegistry.governanceToken()).to.equal(await mockToken.getAddress());
      expect(await researchRegistry.submissionFee()).to.equal(submissionFee);
    });
  });

  describe("Paper Submission", function () {
    it("Should allow submitting a paper with fee", async function () {
      const { researchRegistry, mockToken, addr1, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Approve the registry to spend tokens
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee);
      
      // Submit a paper
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0; // ComputerScience
      
      await expect(researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      )).to.emit(researchRegistry, "PaperSubmitted")
        .withArgs(1, addr1.address, title, cid, hash);
      
      // Check the paper was stored correctly
      const paper = await researchRegistry.getPaperById(1);
      expect(paper.id).to.equal(1n);
      expect(paper.cid).to.equal(cid);
      expect(paper.hash).to.equal(hash);
      expect(paper.title).to.equal(title);
      expect(paper.paperAbstract).to.equal(abstract);
      expect(paper.authors).to.deep.equal(authors);
      expect(paper.category).to.equal(category);
      expect(paper.status).to.equal(0); // Submitted
      expect(paper.submitter).to.equal(addr1.address);
      expect(paper.submissionFee).to.equal(submissionFee);
    });

    it("Should fail if insufficient token approval", async function () {
      const { researchRegistry, mockToken, addr1, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Approve less than the required fee
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee - 1n);
      
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0;
      
      await expect(researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      )).to.be.revertedWith("Fee transfer failed");
    });
  });

  describe("Paper Management", function () {
    it("Should allow owner to approve a paper", async function () {
      const { researchRegistry, mockToken, owner, addr1, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Submit a paper first
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee);
      
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0;
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      // Approve the paper
      await expect(researchRegistry.connect(owner).approvePaper(1))
        .to.emit(researchRegistry, "PaperApproved")
        .withArgs(1, 0, owner.address);
      
      // Check the paper status
      const paper = await researchRegistry.getPaperById(1);
      expect(paper.status).to.equal(1); // Approved
    });

    it("Should allow owner to reject a paper", async function () {
      const { researchRegistry, mockToken, owner, addr1, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Submit a paper first
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee);
      
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0;
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      // Reject the paper
      const reason = "Does not meet quality standards";
      await expect(researchRegistry.connect(owner).rejectPaper(1, reason))
        .to.emit(researchRegistry, "PaperRejected")
        .withArgs(1, owner.address, reason);
      
      // Check the paper status
      const paper = await researchRegistry.getPaperById(1);
      expect(paper.status).to.equal(2); // Rejected
    });

    it("Should fail if non-owner tries to approve/reject", async function () {
      const { researchRegistry, mockToken, addr1, addr2, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Submit a paper first
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee);
      
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0;
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      // Try to approve as non-owner
      await expect(researchRegistry.connect(addr2).approvePaper(1))
        .to.be.revertedWithCustomError(researchRegistry, "OwnableUnauthorizedAccount");
      
      // Try to reject as non-owner
      await expect(researchRegistry.connect(addr2).rejectPaper(1, "Reason"))
        .to.be.revertedWithCustomError(researchRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Fee Management", function () {
    it("Should allow owner to set submission fee", async function () {
      const { researchRegistry, owner } = await loadFixture(deployResearchRegistryFixture);
      
      const newFee = hre.ethers.parseEther("20");
      await expect(researchRegistry.connect(owner).setSubmissionFee(newFee))
        .to.emit(researchRegistry, "SubmissionFeeSet")
        .withArgs(newFee);
      
      expect(await researchRegistry.submissionFee()).to.equal(newFee);
    });

    it("Should fail if non-owner tries to set submission fee", async function () {
      const { researchRegistry, addr1 } = await loadFixture(deployResearchRegistryFixture);
      
      const newFee = hre.ethers.parseEther("20");
      await expect(researchRegistry.connect(addr1).setSubmissionFee(newFee))
        .to.be.revertedWithCustomError(researchRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct paper count", async function () {
      const { researchRegistry, mockToken, addr1, addr2, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Submit papers
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee * 2n);
      await mockToken.connect(addr2).approve(await researchRegistry.getAddress(), submissionFee);
      
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0;
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      await researchRegistry.connect(addr2).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      expect(await researchRegistry.getTotalPapers()).to.equal(3n);
    });

    it("Should return papers by user", async function () {
      const { researchRegistry, mockToken, addr1, submissionFee } = await loadFixture(deployResearchRegistryFixture);
      
      // Submit papers
      await mockToken.connect(addr1).approve(await researchRegistry.getAddress(), submissionFee * 2n);
      
      const cid = "QmExampleCID";
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const title = "Test Paper";
      const abstract = "This is a test paper";
      const authors = ["Author 1", "Author 2"];
      const category = 0;
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      await researchRegistry.connect(addr1).submitPaper(
        cid,
        hash,
        title,
        abstract,
        authors,
        category
      );
      
      const userPapers = await researchRegistry.getPapersByUser(addr1.address);
      expect(userPapers.length).to.equal(2);
      expect(userPapers[0]).to.equal(1n);
      expect(userPapers[1]).to.equal(2n);
    });
  });
});