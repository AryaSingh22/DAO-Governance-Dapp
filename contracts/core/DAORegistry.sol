// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DAORegistry
 * @dev Central registry for all DAO components to make it easier to manage and upgrade the system
 */
contract DAORegistry is Ownable {
    // Mapping to store contract addresses by name
    mapping(string => address) public contracts;
    
    // Mapping to store contract names by address (reverse lookup)
    mapping(address => string) public contractNames;
    
    // Events
    event ContractRegistered(string name, address indexed contractAddress);
    event ContractUnregistered(string name, address indexed contractAddress);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a contract in the registry
     * @param name The name of the contract
     * @param contractAddress The address of the contract
     */
    function registerContract(string memory name, address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        require(bytes(name).length > 0, "Invalid contract name");
        require(contracts[name] == address(0), "Contract already registered with this name");
        
        contracts[name] = contractAddress;
        contractNames[contractAddress] = name;
        
        emit ContractRegistered(name, contractAddress);
    }
    
    /**
     * @dev Unregister a contract from the registry
     * @param name The name of the contract to unregister
     */
    function unregisterContract(string memory name) external onlyOwner {
        address contractAddress = contracts[name];
        require(contractAddress != address(0), "Contract not registered");
        
        delete contracts[name];
        delete contractNames[contractAddress];
        
        emit ContractUnregistered(name, contractAddress);
    }
    
    /**
     * @dev Get a contract address by name
     * @param name The name of the contract
     * @return The address of the contract
     */
    function getContract(string memory name) external view returns (address) {
        return contracts[name];
    }
    
    /**
     * @dev Get a contract name by address
     * @param contractAddress The address of the contract
     * @return The name of the contract
     */
    function getContractName(address contractAddress) external view returns (string memory) {
        return contractNames[contractAddress];
    }
    
    /**
     * @dev Check if a contract is registered
     * @param name The name of the contract
     * @return Whether the contract is registered
     */
    function isRegistered(string memory name) external view returns (bool) {
        return contracts[name] != address(0);
    }
}