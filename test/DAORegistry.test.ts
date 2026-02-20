import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("DAORegistry", function () {
    async function deployRegistryFixture() {
        const [owner, nonOwner, dummyContract] = await hre.ethers.getSigners();
        const DAORegistry = await hre.ethers.getContractFactory("DAORegistry");
        const registry = await DAORegistry.deploy();
        return { registry, owner, nonOwner, dummyContract };
    }

    describe("registerContract", function () {
        it("Should register a contract successfully", async function () {
            const { registry, dummyContract } = await loadFixture(deployRegistryFixture);

            await expect(registry.registerContract("TestContract", dummyContract.address))
                .to.emit(registry, "ContractRegistered")
                .withArgs("TestContract", dummyContract.address);

            expect(await registry.getContract("TestContract")).to.equal(dummyContract.address);
            expect(await registry.getContractName(dummyContract.address)).to.equal("TestContract");
            expect(await registry.isRegistered("TestContract")).to.be.true;
        });

        it("Should revert if caller is not owner", async function () {
            const { registry, nonOwner, dummyContract } = await loadFixture(deployRegistryFixture);
            await expect(registry.connect(nonOwner).registerContract("Test", dummyContract.address))
                .to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
        });

        it("Should revert if contract address is zero", async function () {
            const { registry } = await loadFixture(deployRegistryFixture);
            await expect(registry.registerContract("Test", hre.ethers.ZeroAddress))
                .to.be.revertedWith("Invalid contract address");
        });

        it("Should revert if name is empty", async function () {
            const { registry, dummyContract } = await loadFixture(deployRegistryFixture);
            await expect(registry.registerContract("", dummyContract.address))
                .to.be.revertedWith("Invalid contract name");
        });

        it("Should revert if contract is already registered", async function () {
            const { registry, dummyContract } = await loadFixture(deployRegistryFixture);
            await registry.registerContract("Test", dummyContract.address);
            await expect(registry.registerContract("Test", dummyContract.address))
                .to.be.revertedWith("Contract already registered with this name");
        });
    });

    describe("unregisterContract", function () {
        it("Should unregister a contract successfully", async function () {
            const { registry, dummyContract } = await loadFixture(deployRegistryFixture);
            await registry.registerContract("Test", dummyContract.address);

            await expect(registry.unregisterContract("Test"))
                .to.emit(registry, "ContractUnregistered")
                .withArgs("Test", dummyContract.address);

            expect(await registry.getContract("Test")).to.equal(hre.ethers.ZeroAddress);
            expect(await registry.getContractName(dummyContract.address)).to.equal("");
            expect(await registry.isRegistered("Test")).to.be.false;
        });

        it("Should revert if caller is not owner", async function () {
            const { registry, nonOwner } = await loadFixture(deployRegistryFixture);
            await expect(registry.connect(nonOwner).unregisterContract("Test"))
                .to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
        });

        it("Should revert if contract is not registered", async function () {
            const { registry } = await loadFixture(deployRegistryFixture);
            await expect(registry.unregisterContract("NonExistent"))
                .to.be.revertedWith("Contract not registered");
        });
    });
});
