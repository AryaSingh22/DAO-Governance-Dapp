export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const configuredAddress = (key: string, fallback: string) =>
  (import.meta.env[key] as string | undefined) || fallback;

export const isConfiguredAddress = (address: string) => Boolean(address) && address !== ZERO_ADDRESS;

export const GOVERNOR_ADDRESS = configuredAddress("VITE_GOVERNOR_ADDRESS", "0x59b670e9fA9D0A427751Af201D676719a970857b");
export const TIMELOCK_ADDRESS = configuredAddress("VITE_TIMELOCK_ADDRESS", "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d");
export const TREASURY_ADDRESS = configuredAddress("VITE_TREASURY_ADDRESS", "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1");
export const TOKEN_ADDRESS = configuredAddress("VITE_TOKEN_ADDRESS", "0x68B1D87F95878fE05B998F19b66F4baba5De1aed");
export const MEMBERSHIP_NFT_ADDRESS = configuredAddress("VITE_MEMBERSHIP_NFT_ADDRESS", "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c");
export const RESEARCH_REGISTRY_ADDRESS = configuredAddress("VITE_RESEARCH_REGISTRY_ADDRESS", ZERO_ADDRESS);
export const REPUTATION_MANAGER_ADDRESS = configuredAddress("VITE_REPUTATION_MANAGER_ADDRESS", ZERO_ADDRESS);

export const GOVERNOR_ABI = [
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" },
      { "indexed": false, "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "indexed": false, "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "indexed": false, "internalType": "string[]", "name": "signatures", "type": "string[]" },
      { "indexed": false, "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "indexed": false, "internalType": "uint256", "name": "startBlock", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "endBlock", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" }
    ], "name": "ProposalCreated", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" }
    ], "name": "ProposalExecuted", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" }
    ], "name": "ProposalQueued", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "guardian", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ], "name": "ProposalCanceledByGuardian", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "category", "type": "uint8" },
      { "indexed": false, "internalType": "uint8", "name": "votingMode", "type": "uint8" }
    ], "name": "ProposalMetadataSet", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "paperId", "type": "uint256" }
    ], "name": "ResearchPaperLinked", "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "internalType": "string", "name": "description", "type": "string" }
    ], "name": "propose", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "uint8", "name": "category", "type": "uint8" }
    ], "name": "proposeWithMetadata", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "uint8", "name": "category", "type": "uint8" },
      { "internalType": "uint8", "name": "votingMode", "type": "uint8" },
      { "internalType": "uint256", "name": "linkedPaperId", "type": "uint256" }
    ], "name": "proposeWithMetadata", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }],
    "name": "state", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function"
  },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "internalType": "uint8", "name": "support", "type": "uint8" }], "name": "castVote", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "internalType": "uint8", "name": "support", "type": "uint8" }, { "internalType": "uint256", "name": "votes", "type": "uint256" }], "name": "castQuadraticVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  {
    "inputs": [
      { "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "internalType": "bytes32", "name": "descriptionHash", "type": "bytes32" }
    ], "name": "queue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "internalType": "bytes32", "name": "descriptionHash", "type": "bytes32" }
    ], "name": "execute", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "targets", "type": "address[]" },
      { "internalType": "uint256[]", "name": "values", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "calldatas", "type": "bytes[]" },
      { "internalType": "bytes32", "name": "descriptionHash", "type": "bytes32" }
    ], "name": "hashProposal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function"
  },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "proposalSnapshot", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "proposalDeadline", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  {
    "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "proposalVotes", "outputs": [
      { "internalType": "uint256", "name": "againstVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "forVotes", "type": "uint256" },
      { "internalType": "uint256", "name": "abstainVotes", "type": "uint256" }
    ], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "getProposalMetadata", "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "uint8", "name": "category", "type": "uint8" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "bool", "name": "executed", "type": "bool" },
      { "internalType": "bool", "name": "canceled", "type": "bool" },
      { "internalType": "uint8", "name": "votingMode", "type": "uint8" },
      { "internalType": "uint256", "name": "linkedPaperId", "type": "uint256" }
    ], "stateMutability": "view", "type": "function"
  },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "getProposalCategory", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "isProposalCanceled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "getLinkedPaperId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "internalType": "string", "name": "reason", "type": "string" }], "name": "emergencyCancelProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_researchRegistry", "type": "address" }], "name": "setResearchRegistry", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_reputationManager", "type": "address" }], "name": "setReputationManager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

export const TREASURY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "initialOwner", "type": "address" }],
    "stateMutability": "nonpayable", "type": "constructor"
  },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "EthReceived", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "EthTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "TokenTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "NFTTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256" }], "name": "StreamCreated", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "StreamClaimed", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldGuardian", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newGuardian", "type": "address" }], "name": "GuardianSet", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "guardian", "type": "address" }, { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }], "name": "EmergencyPaused", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256" }], "name": "ResearchFunded", "type": "event" },
  { "inputs": [{ "internalType": "address payable", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "releaseETH", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "releaseERC20", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "contract IERC721", "name": "token", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "releaseERC721", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "contract IERC1155", "name": "token", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "releaseERC1155", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "createStream", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "fundResearch", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "claimStream", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  {
    "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }], "name": "getStreamInfo", "outputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "claimedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "bool", "name": "active", "type": "bool" }
    ], "stateMutability": "view", "type": "function"
  },
  { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }], "name": "getClaimableAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "newGuardian", "type": "address" }], "name": "setGuardian", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "reason", "type": "string" }], "name": "emergencyPause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "guardian", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

export const TOKEN_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }], "name": "delegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

export const MEMBERSHIP_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "string", "name": "_baseURI", "type": "string" },
      { "internalType": "uint256", "name": "_mintPrice", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxSupply", "type": "uint256" }
    ], "stateMutability": "nonpayable", "type": "constructor"
  },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "member", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "MemberJoined", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "member", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "MemberLeft", "type": "event" },
  { "inputs": [{ "internalType": "string", "name": "tokenURI", "type": "string" }], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "string", "name": "tokenURI", "type": "string" }], "name": "mintTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "member", "type": "address" }], "name": "revokeMembership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "bool", "name": "enabled", "type": "bool" }], "name": "setMintingEnabled", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "newPrice", "type": "uint256" }], "name": "setMintPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "newMaxSupply", "type": "uint256" }], "name": "setMaxSupply", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "newBaseURI", "type": "string" }], "name": "setBaseURI", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "member", "type": "address" }], "name": "getMemberSince", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "member", "type": "address" }], "name": "getMembershipTokenId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "member", "type": "address" }], "name": "isMember", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "mintingEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "mintPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "maxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "baseURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }
];

export const RESEARCH_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_governanceToken", "type": "address" },
      { "internalType": "uint256", "name": "_submissionFee", "type": "uint256" }
    ], "stateMutability": "nonpayable", "type": "constructor"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "paperId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "submitter", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "cid", "type": "string" },
      { "indexed": false, "internalType": "bytes32", "name": "hash", "type": "bytes32" }
    ], "name": "PaperSubmitted", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "paperId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "approver", "type": "address" }
    ], "name": "PaperApproved", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "paperId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "rejecter", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ], "name": "PaperRejected", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "newFee", "type": "uint256" }
    ], "name": "SubmissionFeeSet", "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_cid", "type": "string" },
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" },
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_abstract", "type": "string" },
      { "internalType": "string[]", "name": "_authors", "type": "string[]" },
      { "internalType": "uint8", "name": "_category", "type": "uint8" }
    ], "name": "submitPaper", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_paperId", "type": "uint256" },
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ], "name": "linkProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_paperId", "type": "uint256" }
    ], "name": "approvePaper", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_paperId", "type": "uint256" },
      { "internalType": "string", "name": "_reason", "type": "string" }
    ], "name": "rejectPaper", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_newFee", "type": "uint256" }
    ], "name": "setSubmissionFee", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_paperId", "type": "uint256" }
    ], "name": "getPaperById", "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "paperAbstract", "type": "string" },
      { "internalType": "string[]", "name": "authors", "type": "string[]" },
      { "internalType": "uint8", "name": "category", "type": "uint8" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      { "internalType": "address", "name": "submitter", "type": "address" },
      { "internalType": "uint256", "name": "submissionTime", "type": "uint256" },
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
      { "internalType": "uint256", "name": "submissionFee", "type": "uint256" }
    ], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ], "name": "getPapersByUser", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function"
  },
  { "inputs": [], "name": "getTotalPapers", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "submissionFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "governanceToken", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
];

export const REPUTATION_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "string", "name": "initialBaseURI", "type": "string" }
    ], "stateMutability": "nonpayable", "type": "constructor"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "points", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ], "name": "PointsAdded", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "badgeId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "badgeName", "type": "string" }
    ], "name": "BadgeAwarded", "type": "event"
  },
  {
    "anonymous": false, "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "badgeId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "pointsRequired", "type": "uint256" }
    ], "name": "BadgeTierCreated", "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "uint256", "name": "_pointsRequired", "type": "uint256" },
      { "internalType": "string", "name": "_tokenURI", "type": "string" }
    ], "name": "createBadgeTier", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_points", "type": "uint256" },
      { "internalType": "string", "name": "_reason", "type": "string" }
    ], "name": "addPoints", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ], "name": "addSubmissionPoints", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ], "name": "addVotingPoints", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ], "name": "addReviewPoints", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ], "name": "getUserReputation", "outputs": [
      { "internalType": "uint256", "name": "totalPoints", "type": "uint256" },
      { "internalType": "uint256", "name": "submissions", "type": "uint256" },
      { "internalType": "uint256", "name": "votes", "type": "uint256" },
      { "internalType": "uint256", "name": "reviews", "type": "uint256" }
    ], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ], "name": "getUserBadges", "outputs": [{ "internalType": "uint256[]", "name": "badgeIds", "type": "uint256[]" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_badgeId", "type": "uint256" }
    ], "name": "getBadgeDetails", "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "pointsRequired", "type": "uint256" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_limit", "type": "uint256" }
    ], "name": "getLeaderboard", "outputs": [{ "internalType": "address[]", "name": "topContributors", "type": "address[]" }], "stateMutability": "view", "type": "function"
  },
  { "inputs": [], "name": "baseTokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }
];
