// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * Advanced Treasury vault controlled by Timelock (as owner).
 * Supports ETH, ERC20, ERC721, ERC1155 assets with streaming payments.
 * Guardian role can pause operations in emergencies.
 */
contract Treasury is Ownable, Pausable, ReentrancyGuard {
    event EthReceived(address indexed from, uint256 amount);
    event EthTransferred(address indexed to, uint256 amount);
    event TokenTransferred(address indexed token, address indexed to, uint256 amount); 
    event NFTTransferred(address indexed token, address indexed to, uint256 tokenId);
    event StreamCreated(address indexed recipient, uint256 amount, uint256 duration, uint256 startTime);
    event StreamClaimed(address indexed recipient, uint256 amount);
    event GuardianSet(address indexed oldGuardian, address indexed newGuardian);
    event EmergencyPaused(address indexed guardian, string reason);

    struct Stream {
        address recipient;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 duration;
        bool active;
    }

    address public guardian;
    mapping(address => Stream) public streams;
    mapping(address => uint256) public streamIds;

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Treasury: caller is not guardian");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        guardian = initialOwner; // Initially set to owner
    }

    receive() external payable whenNotPaused {
        emit EthReceived(msg.sender, msg.value);
    }

    // Guardian management
    function setGuardian(address newGuardian) external onlyOwner {
        address oldGuardian = guardian;
        guardian = newGuardian;
        emit GuardianSet(oldGuardian, newGuardian);
    }

    function emergencyPause(string calldata reason) external onlyGuardian {
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ETH operations
    function releaseETH(address payable to, uint256 amount) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "invalid to");
        require(amount <= address(this).balance, "insufficient balance");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "ETH transfer failed");
        emit EthTransferred(to, amount);
    }

    // ERC20 operations
    function releaseERC20(IERC20 token, address to, uint256 amount) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "invalid to");
        require(token.transfer(to, amount), "Token transfer failed");
        emit TokenTransferred(address(token), to, amount);
    }

    // ERC721 operations
    function releaseERC721(IERC721 token, address to, uint256 tokenId) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "invalid to");
        require(token.ownerOf(tokenId) == address(this), "token not owned by treasury");
        token.transferFrom(address(this), to, tokenId);
        emit NFTTransferred(address(token), to, tokenId);
    }

    // ERC1155 operations
    function releaseERC1155(IERC1155 token, address to, uint256 id, uint256 amount) external onlyOwner whenNotPaused nonReentrant {
        require(to != address(0), "invalid to");
        token.safeTransferFrom(address(this), to, id, amount, "");
        emit TokenTransferred(address(token), to, amount);
    }

    // Streaming payments
    function createStream(address recipient, uint256 amount, uint256 duration) external onlyOwner whenNotPaused {
        require(recipient != address(0), "invalid recipient");
        require(amount > 0, "amount must be > 0");
        require(duration > 0, "duration must be > 0");
        require(address(this).balance >= amount, "insufficient ETH balance");

        streamIds[recipient]++;
        streams[recipient] = Stream({
            recipient: recipient,
            totalAmount: amount,
            claimedAmount: 0,
            startTime: block.timestamp,
            duration: duration,
            active: true
        });

        emit StreamCreated(recipient, amount, duration, block.timestamp);
    }

    function claimStream() external whenNotPaused nonReentrant {
        Stream storage stream = streams[msg.sender];
        require(stream.active, "no active stream");
        require(block.timestamp >= stream.startTime, "stream not started");

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 totalClaimable = (stream.totalAmount * elapsed) / stream.duration;
        uint256 claimable = totalClaimable - stream.claimedAmount;

        require(claimable > 0, "nothing to claim");

        stream.claimedAmount += claimable;
        
        if (stream.claimedAmount >= stream.totalAmount) {
            stream.active = false;
        }

        (bool sent, ) = msg.sender.call{value: claimable}("");
        require(sent, "ETH transfer failed");
        
        emit StreamClaimed(msg.sender, claimable);
    }

    function getStreamInfo(address recipient) external view returns (Stream memory) {
        return streams[recipient];
    }

    function getClaimableAmount(address recipient) external view returns (uint256) {
        Stream storage stream = streams[recipient];
        if (!stream.active || block.timestamp < stream.startTime) return 0;
        
        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 totalClaimable = (stream.totalAmount * elapsed) / stream.duration;
        return totalClaimable > stream.claimedAmount ? totalClaimable - stream.claimedAmount : 0;
    }
}


