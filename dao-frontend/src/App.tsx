// IMPORTANT: To fix the "Could not resolve 'ethers'" error, you need to install the library.
// Open your terminal in the `dao-frontend` project folder and run this command:
// npm install ethers
import { useState, useEffect } from 'react';
import { ethers, BrowserProvider, ContractTransactionResponse } from 'ethers';

// --- Step 1: Add the ABI of your Governance Token ---
const GOVERNANCE_TOKEN_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "ERC2612ExpiredSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC2612InvalidSigner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "fromDelegate",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "toDelegate",
        "type": "address"
      }
    ],
    "name": "DelegateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "previousBalance",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newBalance",
        "type": "uint256"
      }
    ],
    "name": "DelegateVotesChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "EIP712DomainChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CLOCK_MODE",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burnFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clock",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "delegatee",
        "type": "address"
      }
    ],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "delegatee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "delegateBySig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "delegates",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      {
        "internalType": "bytes1",
        "name": "fields",
        "type": "bytes1"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "verifyingContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "extensions",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "getPastTotalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "getPastVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// --- Step 2: Add the address of your deployed Governance Token contract ---
// Remember to update this with your new address every time you restart the backend!
const GOVERNANCE_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// --- Define a specific type for our contract to help TypeScript ---
type GovernanceToken = ethers.Contract & {
    name: () => Promise<string>;
    symbol: () => Promise<string>;
    balanceOf: (owner: string) => Promise<bigint>;
    getVotes: (account: string) => Promise<bigint>;
    delegates: (account: string) => Promise<string>;
    mint: (to: string, amount: bigint) => Promise<ContractTransactionResponse>;
    delegate: (delegatee: string) => Promise<ContractTransactionResponse>;
};

// --- Main App Component ---
function App() {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<GovernanceToken | null>(null);
    
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenBalance, setTokenBalance] = useState("0");
    const [votingPower, setVotingPower] = useState("0");
    const [delegatee, setDelegatee] = useState("");
    
    const [mintAmount, setMintAmount] = useState("100");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // --- Effects ---

    useEffect(() => {
        if ((window as any).ethereum) {
            const newProvider = new BrowserProvider((window as any).ethereum);
            setProvider(newProvider);
        } else {
            showMessage("Please install MetaMask to use this application.", "error");
        }
    }, []);

    useEffect(() => {
        const setupEventListeners = () => {
            if ((window as any).ethereum) {
                const handleAccountsChanged = async (accounts: string[]) => {
                    if (accounts.length > 0) {
                        await connectWallet();
                    } else {
                        setAccount(null);
                        resetState();
                    }
                };
                (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
            }
        };

        setupEventListeners();
        return () => {
            if ((window as any).ethereum) {
                (window as any).ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);
    
    // --- Helper Functions ---
    
    const showMessage = (text: string, type: string, duration = 5000) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), duration);
    };

    const resetState = () => {
        setAccount(null);
        setContract(null);
        setTokenName("");
        setTokenSymbol("");
        setTokenBalance("0");
        setVotingPower("0");
        setDelegatee("");
    };

    const fetchTokenData = async (contractInstance: GovernanceToken, userAddress: string) => {
        try {
            setIsLoading(true);
            const name = await contractInstance.name();
            const symbol = await contractInstance.symbol();
            const balance = await contractInstance.balanceOf(userAddress);
            const votes = await contractInstance.getVotes(userAddress);
            const currentDelegatee = await contractInstance.delegates(userAddress);

            setTokenName(name);
            setTokenSymbol(symbol);
            setTokenBalance(ethers.formatEther(balance));
            setVotingPower(ethers.formatEther(votes));
            setDelegatee(currentDelegatee);
        } catch (error) {
            console.error("Error fetching token data:", error);
            if ((error as any).message.includes("call revert exception")) {
                 showMessage("Failed to fetch token data. Are you on the correct network?", "error");
            } else {
                 showMessage("An error occurred while fetching data.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Event Handlers ---

    const connectWallet = async () => {
        if (!provider) {
            showMessage("MetaMask is not installed.", "error");
            return;
        }
        setIsConnecting(true);
        try {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);
            // Cast the contract to our specific type here
            const tokenContract = new ethers.Contract(
                GOVERNANCE_TOKEN_ADDRESS,
                GOVERNANCE_TOKEN_ABI,
                signer
            ) as GovernanceToken;
            setContract(tokenContract);
            await fetchTokenData(tokenContract, address);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            showMessage("Failed to connect wallet. See console for details.", "error");
            resetState();
        } finally {
            setIsConnecting(false);
        }
    };

    const handleMint = async () => {
        if (!contract || !account) return;
        setIsLoading(true);
        try {
            const amount = ethers.parseEther(mintAmount);
            // No need to reconnect signer or cast, 'contract' is already correctly typed
            const tx = await contract.mint(account, amount);
            await tx.wait();
            showMessage(`Successfully minted ${mintAmount} ${tokenSymbol}!`, "success");
            await fetchTokenData(contract, account);
        } catch (error) {
            console.error("Error minting tokens:", error);
            showMessage("Minting failed. See console for details.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelegate = async () => {
        if (!contract || !account) return;
        setIsLoading(true);
        try {
            // No need to reconnect signer or cast, 'contract' is already correctly typed
            const tx = await contract.delegate(account);
            await tx.wait();
            showMessage("Successfully delegated voting power to yourself!", "success");
            await fetchTokenData(contract, account);
        } catch (error) {
            console.error("Error delegating votes:", error);
            showMessage("Delegation failed. See console for details.", "error");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Render ---

    return (
      <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
            <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        </div>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 font-sans">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" className="text-cyan-300"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m42.44 157.23l-30.22-30.22a48 48 0 1 1-24.44-24.44l30.22 30.22a8 8 0 0 1-11.32 11.32l-30.22-30.22a48 48 0 1 1 11.32-11.32l30.22 30.22a8 8 0 1 1-11.32 11.32l-30.22-30.22a48 48 0 1 1 11.32-11.32l30.22 30.22a8 8 0 0 1-11.32 11.32L94.77 124.4a47.54 47.54 0 0 1-19.21-19.21l30.22-30.22a8 8 0 1 1 11.31-11.32l-30.21 30.22a48 48 0 1 1 24.43 24.44l30.22-30.22a8 8 0 0 1 11.32 11.32l-30.22 30.22a48 48 0 1 1-11.32 11.32l30.22-30.22a8 8 0 0 1 11.32 11.32l-30.22 30.22a48 48 0 1 1 19.21 19.21l30.22 30.22a8 8 0 1 1-11.32 11.31Z"/></svg>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-100">DAO Governance</h1>
                    </div>
                    {!account ? (
                        <button 
                            onClick={connectWallet} 
                            disabled={isConnecting}
                            className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-wait text-cyan-300 font-bold py-2 px-5 rounded-lg shadow-lg shadow-cyan-500/10 transition-all duration-300"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                    ) : (
                        <div className="text-right bg-slate-900/50 border border-slate-700/80 px-4 py-2 rounded-lg">
                           <p className="text-xs text-slate-400">Connected Wallet</p>
                           <p className="font-mono text-sm text-slate-200">{account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
                        </div>
                    )}
                </header>
                
                {/* Main Content Area */}
                <div className="bg-black/30 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-slate-900/50">
                    {/* Message Banner */}
                    {message.text && (
                        <div className={`p-3 mb-6 rounded-lg text-center font-semibold text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    {!account ? (
                        <div className="text-center py-16">
                            <h2 className="text-2xl font-semibold mb-2 text-slate-200">Welcome</h2>
                            <p className="text-slate-400 max-w-md mx-auto">Please connect your wallet to begin managing your DAO tokens and voting power.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Token Info Card */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        Token Information
                                    </h3>
                                    <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-slate-400">Name</p>
                                            <p className="font-medium text-slate-100">{tokenName || '...'}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-slate-400">Symbol</p>
                                            <p className="font-medium bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-md">{tokenSymbol || '...'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Status Card */}
                                <div className="space-y-4">
                                     <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Your Status
                                    </h3>
                                    <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-3">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-slate-400">Balance</p>
                                            <p className="text-xl font-bold text-slate-100">{parseFloat(tokenBalance).toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-slate-400">Voting Power</p>
                                            <p className="text-xl font-bold text-slate-100">{parseFloat(votingPower).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="space-y-6 pt-6 border-t border-slate-800">
                                <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                    Governance Actions
                                </h3>
                                {/* Mint Tokens */}
                                <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-1">
                                        <p className="font-medium text-slate-100">1. Get Tokens</p>
                                        <p className="text-slate-400 text-xs mt-1">Mint new test tokens to your wallet.</p>
                                    </div>
                                    <div className="md:col-span-2 flex items-center space-x-2">
                                        <input 
                                            type="number"
                                            value={mintAmount}
                                            onChange={(e) => setMintAmount(e.target.value)}
                                            className="bg-slate-950 border border-slate-700 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <button 
                                            onClick={handleMint} 
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed shrink-0"
                                        >
                                            {isLoading ? '...' : 'Mint'}
                                        </button>
                                    </div>
                                </div>

                                {/* Delegate Votes */}
                                <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-1">
                                        <p className="font-medium text-slate-100">2. Activate Power</p>
                                        <p className="text-slate-400 text-xs mt-1">Delegate tokens to your address to vote.</p>
                                    </div>
                                     <div className="md:col-span-2">
                                        <button 
                                            onClick={handleDelegate} 
                                            disabled={isLoading || (delegatee.toLowerCase() === (account || '').toLowerCase())}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {delegatee.toLowerCase() === (account || '').toLowerCase() ? 'Votes Delegated' : (isLoading ? '...' : 'Delegate Votes to Self')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
      </div>
    );
}

export default App;
