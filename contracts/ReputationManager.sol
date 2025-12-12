// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; 
 
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol"; 
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * Reputation Manager - tracks user contributions and awards NFT badges
 * Handles reputation points for submissions, votes, and reviews
 */
contract ReputationManager is ERC721, ERC721URIStorage, Ownable {
    struct BadgeTier {
        string name;
        string description;
        uint256 pointsRequired;
        string tokenURI;
    }
    
    struct UserReputation {
        uint256 totalPoints;
        uint256 submissions;
        uint256 votes;
        uint256 reviews;
        mapping(uint256 => bool) badges; // badgeId => owned
    }
    
    uint256 private _badgeIds;
    string public baseTokenURI;
    
    mapping(uint256 => BadgeTier) public badgeTiers;
    mapping(address => UserReputation) public userReputations;
    mapping(address => uint256[]) public userBadges; // user => badgeIds
    
    // Predefined badge tiers
    uint256 public constant RESEARCHER_BADGE = 1;
    uint256 public constant CONTRIBUTOR_BADGE = 2;
    uint256 public constant EXPERT_BADGE = 3;
    uint256 public constant VISIONARY_BADGE = 4;
    
    event PointsAdded(address indexed user, uint256 points, string reason);
    event BadgeAwarded(address indexed user, uint256 badgeId, string badgeName);
    event BadgeTierCreated(uint256 badgeId, string name, uint256 pointsRequired);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory initialBaseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        baseTokenURI = initialBaseURI;
        
        // Create default badge tiers
        _createBadgeTier("Researcher", "Submitted first research paper", 100, "ipfs://researcher.json");
        _createBadgeTier("Contributor", "Active community contributor", 500, "ipfs://contributor.json");
        _createBadgeTier("Expert", "Recognized domain expert", 1000, "ipfs://expert.json");
        _createBadgeTier("Visionary", "DAO visionary and leader", 2000, "ipfs://visionary.json");
    }
    
    /**
     * @dev Create a new badge tier
     * @param _name Name of the badge
     * @param _description Description of the badge
     * @param _pointsRequired Points required to earn this badge
     * @param _tokenURI IPFS URI for the badge metadata
     */
    function createBadgeTier(
        string memory _name,
        string memory _description,
        uint256 _pointsRequired,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        return _createBadgeTier(_name, _description, _pointsRequired, _tokenURI);
    }
    
    function _createBadgeTier(
        string memory _name,
        string memory _description,
        uint256 _pointsRequired,
        string memory _tokenURI
    ) internal returns (uint256) {
        _badgeIds++;
        uint256 newBadgeId = _badgeIds;
        
        badgeTiers[newBadgeId] = BadgeTier({
            name: _name,
            description: _description,
            pointsRequired: _pointsRequired,
            tokenURI: _tokenURI
        });
        
        emit BadgeTierCreated(newBadgeId, _name, _pointsRequired);
        
        return newBadgeId;
    }
    
    /**
     * @dev Add reputation points to a user
     * @param _user Address of the user
     * @param _points Number of points to add
     * @param _reason Reason for adding points
     */
    function addPoints(address _user, uint256 _points, string memory _reason) external onlyOwner {
        userReputations[_user].totalPoints += _points;
        emit PointsAdded(_user, _points, _reason);
        
        // Check for new badges
        _checkForBadges(_user);
    }
    
    /**
     * @dev Add points for paper submission
     * @param _user Address of the user
     */
    function addSubmissionPoints(address _user) external onlyOwner {
        userReputations[_user].totalPoints += 50;
        userReputations[_user].submissions += 1;
        emit PointsAdded(_user, 50, "Paper submission");
        
        // Check for new badges
        _checkForBadges(_user);
    }
    
    /**
     * @dev Add points for voting
     * @param _user Address of the user
     */
    function addVotingPoints(address _user) external onlyOwner {
        userReputations[_user].totalPoints += 10;
        userReputations[_user].votes += 1;
        emit PointsAdded(_user, 10, "Voting on proposal");
        
        // Check for new badges
        _checkForBadges(_user);
    }
    
    /**
     * @dev Add points for reviewing papers
     * @param _user Address of the user
     */
    function addReviewPoints(address _user) external onlyOwner {
        userReputations[_user].totalPoints += 25;
        userReputations[_user].reviews += 1;
        emit PointsAdded(_user, 25, "Reviewing paper");
        
        // Check for new badges
        _checkForBadges(_user);
    }
    
    /**
     * @dev Check if user qualifies for any new badges
     * @param _user Address of the user
     */
    function _checkForBadges(address _user) internal {
        UserReputation storage userRep = userReputations[_user];
        uint256 points = userRep.totalPoints;
        
        // Check each badge tier
        for (uint256 i = 1; i <= _badgeIds; i++) {
            BadgeTier storage badge = badgeTiers[i];
            
            // Skip if user already has this badge
            if (userRep.badges[i]) continue;
            
            // Award badge if user has enough points
            if (points >= badge.pointsRequired) {
                _awardBadge(_user, i);
            }
        }
    }
    
    /**
     * @dev Award a badge to a user
     * @param _user Address of the user
     * @param _badgeId ID of the badge to award
     */
    function _awardBadge(address _user, uint256 _badgeId) internal {
        BadgeTier storage badge = badgeTiers[_badgeId];
        
        // Mint the badge NFT
        _safeMint(_user, _badgeId);
        _setTokenURI(_badgeId, badge.tokenURI);
        
        // Mark user as having this badge
        userReputations[_user].badges[_badgeId] = true;
        userBadges[_user].push(_badgeId);
        
        emit BadgeAwarded(_user, _badgeId, badge.name);
    }
    
    /**
     * @dev Get user's reputation data
     * @param _user Address of the user
     * @return totalPoints Total reputation points
     * @return submissions Number of paper submissions
     * @return votes Number of votes cast
     * @return reviews Number of paper reviews
     */
    function getUserReputation(address _user) external view returns (
        uint256 totalPoints,
        uint256 submissions,
        uint256 votes,
        uint256 reviews
    ) {
        UserReputation storage userRep = userReputations[_user];
        return (
            userRep.totalPoints,
            userRep.submissions,
            userRep.votes,
            userRep.reviews
        );
    }
    
    /**
     * @dev Get user's badges
     * @param _user Address of the user
     * @return badgeIds Array of badge IDs
     */
    function getUserBadges(address _user) external view returns (uint256[] memory badgeIds) {
        return userBadges[_user];
    }
    
    /**
     * @dev Get badge details
     * @param _badgeId ID of the badge
     * @return badge BadgeTier struct
     */
    function getBadgeDetails(uint256 _badgeId) external view returns (BadgeTier memory badge) {
        return badgeTiers[_badgeId];
    }
    
    /**
     * @dev Get leaderboard of top contributors
     * @param _limit Number of users to return
     * @return topContributors Array of top contributors
     */
    function getLeaderboard(uint256 _limit) external view returns (address[] memory topContributors) {
        // This would require more complex logic to sort users by points
        // For simplicity, we'll return an empty array
        // In a production implementation, this would return sorted addresses
        address[] memory result = new address[](_limit);
        return result;
    }
    
    // Override functions required by Solidity
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}




