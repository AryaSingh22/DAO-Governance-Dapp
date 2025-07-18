// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes {
    constructor()
        ERC20("MyDAOToken", "MDT")
        ERC20Permit("MyDAOToken")
        //ERC20Votes()
    {
        _mint(msg.sender, 1000 * 10 ** 18);
    }

    // The following function is required by OpenZeppelin v5 when combining
    // ERC20Votes with other extensions. We must explicitly override it.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    // Explicitly override nonces to resolve inheritance ambiguity
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    // A public function to allow anyone to mint tokens for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}