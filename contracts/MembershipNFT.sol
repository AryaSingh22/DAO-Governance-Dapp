// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; 

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol"; 
 
/**
 * DAO Membership NFT - represents membership in the DAO
 * Can be minted by governance proposals or by meeting certain criteria
 */
contract MembershipNFT is ERC721, ERC721URIStorage, Ownable { 
    uint256 private _tokenIds;
     
    string public baseTokenURI;
    bool public mintingEnabled;
    uint256 public mintPrice;
    uint256 public maxSupply;
    
    mapping(address => bool) public isMember;
    mapping(uint256 => uint256) public memberSince; // tokenId => timestamp
    mapping(address => uint256) public memberTokenId; // member => tokenId

    event MemberJoined(address indexed member, uint256 tokenId);
    event MemberLeft(address indexed member, uint256 tokenId);
    event MintingToggled(bool enabled);
    event MintPriceSet(uint256 newPrice);
    event MaxSupplySet(uint256 newMaxSupply);

    constructor(
        string memory name,
        string memory symbol,
        string memory initialBaseURI,
        uint256 _mintPrice,
        uint256 _maxSupply
    ) ERC721(name, symbol) Ownable(msg.sender) {
        baseTokenURI = initialBaseURI;
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
        mintingEnabled = true;
    }

    function mint(string memory _tokenURI) external payable {
        require(mintingEnabled, "Minting disabled");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds < maxSupply, "Max supply reached");
        require(!isMember[msg.sender], "Already a member");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        isMember[msg.sender] = true;
        memberTokenId[msg.sender] = newTokenId;
        memberSince[newTokenId] = block.timestamp;

        emit MemberJoined(msg.sender, newTokenId);
    }

    function mintTo(address to, string memory _tokenURI) external onlyOwner {
        require(_tokenIds < maxSupply, "Max supply reached");
        require(!isMember[to], "Already a member");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        isMember[to] = true;
        memberTokenId[to] = newTokenId;
        memberSince[newTokenId] = block.timestamp;

        emit MemberJoined(to, newTokenId);
    }

    function burn(uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        
        address owner = ownerOf(tokenId);
        isMember[owner] = false;
        delete memberTokenId[owner];
        
        _burn(tokenId);
        emit MemberLeft(owner, tokenId);
    }

    function revokeMembership(address member) external onlyOwner {
        uint256 tokenId = memberTokenId[member];
        require(tokenId > 0, "No membership found");
        require(ownerOf(tokenId) == member, "Invalid membership");
        
        isMember[member] = false;
        delete memberTokenId[member];
        _burn(tokenId);
        emit MemberLeft(member, tokenId);
    }

    // Admin functions
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
        emit MintingToggled(enabled);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceSet(newPrice);
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= _tokenIds, "Cannot reduce below current supply");
        maxSupply = newMaxSupply;
        emit MaxSupplySet(newMaxSupply);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // View functions
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    function getMemberSince(address member) external view returns (uint256) {
        uint256 tokenId = memberTokenId[member];
        require(tokenId > 0, "Not a member");
        return memberSince[tokenId];
    }

    function getMembershipTokenId(address member) external view returns (uint256) {
        return memberTokenId[member];
    }

    // Overrides
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // Helper function to check if caller is owner or approved
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }
}
