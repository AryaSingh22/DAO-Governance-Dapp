// IMPORTANT: To fix the "Could not resolve 'ethers'" error, you need to install the library.
// Open your terminal in the `dao-frontend` project folder and run this command:
// npm install ethers
import { useEffect, useState } from 'react'
import { BrowserProvider, Contract, ethers } from 'ethers'
import { TOKEN_ADDRESS, TOKEN_ABI } from './config/contracts'
import Governance from './components/Governance'
import ProposalHistory from './components/ProposalHistory'
import Dashboard from './components/Dashboard'

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [token, setToken] = useState<Contract | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [delegatedTo, setDelegatedTo] = useState<string>('')
  const [delegatee, setDelegatee] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'governance' | 'history' | 'token'>('dashboard')

  useEffect(() => {
    if ((window as any).ethereum) {
      const p = new BrowserProvider((window as any).ethereum)
      setProvider(p)
    }
  }, [])

  useEffect(() => {
    (async () => {
      if (!provider) return
      const signer = await provider.getSigner()
      try {
        const addr = await signer.getAddress()
        setAccount(addr)
      } catch {}
      const t = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer)
      setToken(t)
    })()
  }, [provider])

  useEffect(() => {
    (async () => {
      if (!token || !account) return
      const bal = await token.balanceOf(account)
      setBalance(ethers.formatEther(bal))
      const votes = await token.getVotes(account)
      setDelegatedTo(ethers.formatEther(votes))
    })()
  }, [token, account])

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('Please install MetaMask!')
      return
    }
    try {
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      window.location.reload()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const mintTokens = async () => {
    if (!token) return
    try {
      const tx = await token.mint(account, ethers.parseEther('1000'))
      await tx.wait()
      window.location.reload()
    } catch (error) {
      console.error('Error minting tokens:', error)
    }
  }

  const delegateVotes = async () => {
    if (!token || !delegatee) return
    try {
      const tx = await token.delegate(delegatee)
      await tx.wait()
      window.location.reload()
    } catch (error) {
      console.error('Error delegating votes:', error)
    }
  }

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-cyan-600 text-white'
          : 'text-slate-300 hover:text-white hover:bg-slate-700'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-300">
          🗳️ Advanced DAO Governance Platform
        </h1>

        {!account ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Account Info */}
            <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-sm">Connected Account</p>
                  <p className="font-mono text-slate-100">{account}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Token Balance</p>
                  <p className="text-cyan-300 font-semibold">{balance} TDT</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton id="dashboard" label="Dashboard" icon="📊" />
              <TabButton id="governance" label="Governance" icon="🗳️" />
              <TabButton id="history" label="History" icon="📜" />
              <TabButton id="token" label="Token" icon="🪙" />
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'governance' && <Governance />}
            {activeTab === 'history' && <ProposalHistory />}
            {activeTab === 'token' && (
              <div className="space-y-6 mt-8">
                <h3 className="text-lg font-semibold text-cyan-300">Token Management</h3>
                
                <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Your Voting Power</p>
                    <p className="text-cyan-300 font-semibold">{delegatedTo} TDT</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Delegate to Address</label>
                      <input
                        value={delegatee}
                        onChange={(e) => setDelegatee(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={delegateVotes}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
                      >
                        Delegate Votes
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={mintTokens}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                    >
                      Mint 1000 Tokens
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
