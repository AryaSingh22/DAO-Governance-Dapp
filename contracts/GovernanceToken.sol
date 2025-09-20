// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";      
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";    
       
/**
 * GovernanceToken: ERC20Votes with permit, burn, and pausability.
 * - Owner can mint and pause/unpause 
 * - Compatible with OpenZeppelin Governor (IVotes)
 */
contract GovernanceToken is
    ERC20,
    ERC20Permit,
    ERC20Votes,
    ERC20Burnable,
    Ownable,
    Pausable
{
    constructor()
        ERC20("Governance Token", "TDT")
        ERC20Permit("Governance Token")
        Ownable(msg.sender)
    {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    // Admin actions
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Override nonces function to resolve conflict between ERC20Permit and Nonces
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // Internal hooks and overrides
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
        whenNotPaused 
    {
        super._update(from, to, value);
    }

    // Remove the _mint override since it's not virtual in ERC20
    // The _mint function from ERC20Burnable will be used instead

    // Remove the _burn override since it's not virtual in ERC20
    // The _burn function from ERC20Burnable will be used instead
}
