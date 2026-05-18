import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract, ethers } from 'ethers'
import {
  Award,
  BarChart3,
  BookOpen,
  Coins,
  FileClock,
  Landmark,
  Loader2,
  Network,
  RefreshCw,
  ShieldCheck,
  Vote,
  Wallet,
} from 'lucide-react'
import {
  MEMBERSHIP_NFT_ADDRESS,
  MEMBERSHIP_NFT_ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
  ZERO_ADDRESS,
} from './config/contracts'
import Governance from './components/Governance'
import ProposalHistory from './components/ProposalHistory'
import Dashboard from './components/Dashboard'
import ResearchSubmission from './components/ResearchSubmission'
import ResearchArchive from './components/ResearchArchive'
import ReputationBadges from './components/ReputationBadges'

type TabId = 'dashboard' | 'governance' | 'research' | 'reputation' | 'history' | 'token'
type WalletProvider = NonNullable<Window['ethereum']> & {
  on?: (event: string, handler: (value: unknown) => void) => void
  removeListener?: (event: string, handler: (value: unknown) => void) => void
}

const tabs: Array<{ id: TabId; label: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'governance', label: 'Governance', icon: Vote },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'reputation', label: 'Reputation', icon: Award },
  { id: 'history', label: 'History', icon: FileClock },
  { id: 'token', label: 'Token', icon: Coins },
]

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

async function requestWalletAccounts(ethereum: WalletProvider, forcePicker: boolean) {
  if (forcePicker) {
    try {
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
    } catch (error) {
      console.warn('Wallet account picker was unavailable or cancelled:', error)
    }
  }

  return ethereum.request({ method: 'eth_requestAccounts' }) as Promise<string[]>
}

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [token, setToken] = useState<Contract | null>(null)
  const [membershipNFT, setMembershipNFT] = useState<Contract | null>(null)
  const [balance, setBalance] = useState('0')
  const [votingPower, setVotingPower] = useState('0')
  const [delegatedTo, setDelegatedTo] = useState(ZERO_ADDRESS)
  const [tokenOwner, setTokenOwner] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [delegatee, setDelegatee] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [status, setStatus] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    const ethereum = window.ethereum as WalletProvider | undefined
    if (!ethereum) return

    const nextProvider = new BrowserProvider(ethereum)
    setProvider(nextProvider)

    ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      const [firstAccount] = accounts as string[]
      if (firstAccount) setAccount(firstAccount)
    }).catch(console.error)

    const handleAccountsChanged = (value: unknown) => {
      const [nextAccount] = value as string[]
      setAccount(nextAccount ?? null)
      setStatus(nextAccount ? `Wallet switched to ${shortAddress(nextAccount)}.` : 'Wallet disconnected.')
    }

    const handleChainChanged = () => {
      setProvider(new BrowserProvider(ethereum))
      setStatus('Network changed. Wallet data refreshed.')
    }

    ethereum.on?.('accountsChanged', handleAccountsChanged)
    ethereum.on?.('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [])

  useEffect(() => {
    if (!provider || !account) {
      setToken(null)
      setMembershipNFT(null)
      return
    }

    provider.getSigner().then((signer) => {
      setToken(new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer))
      setMembershipNFT(new Contract(MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI, signer))
    }).catch(console.error)
  }, [provider, account])

  const refreshTokenState = useCallback(async () => {
    if (!token || !account) return
    try {
      const [rawBalance, rawVotes, currentDelegate, ownerAddress, membershipStatus] = await Promise.all([
        token.balanceOf(account),
        token.getVotes(account),
        token.delegates(account),
        token.owner(),
        membershipNFT ? membershipNFT.isMember(account) : Promise.resolve(false),
      ])
      setBalance(ethers.formatEther(rawBalance))
      setVotingPower(ethers.formatEther(rawVotes))
      setDelegatedTo(currentDelegate)
      setTokenOwner(ownerAddress)
      setIsMember(Boolean(membershipStatus))
    } catch (error) {
      console.error('Failed to load token state:', error)
    }
  }, [token, membershipNFT, account])

  useEffect(() => {
    refreshTokenState()
  }, [refreshTokenState])

  const connectWallet = async () => {
    const ethereum = window.ethereum as WalletProvider | undefined
    if (!ethereum) {
      setStatus('MetaMask or another EIP-1193 wallet is required.')
      return
    }

    setIsWorking(true)
    try {
      const accounts = await requestWalletAccounts(ethereum, Boolean(account))
      setAccount(accounts[0] ?? null)
      setProvider(new BrowserProvider(ethereum))
      setStatus(accounts[0] ? `Wallet connected: ${shortAddress(accounts[0])}.` : 'No wallet account selected.')
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setStatus('Wallet connection was cancelled or failed.')
    } finally {
      setIsWorking(false)
    }
  }

  const mintTokens = async () => {
    if (!token || !account) return
    if (!isTokenOwner) {
      setStatus(`Minting is owner-only. Token owner: ${shortAddress(tokenOwner)}`)
      return
    }

    setIsWorking(true)
    setStatus('Minting governance tokens...')
    try {
      const tx = await token.mint(account, ethers.parseEther('1000'))
      await tx.wait()
      await refreshTokenState()
      setStatus('Minted 1,000 governance tokens.')
    } catch (error) {
      console.error('Error minting tokens:', error)
      setStatus('Mint failed. Only the token owner can mint new supply.')
    } finally {
      setIsWorking(false)
    }
  }

  const delegateVotes = async () => {
    if (!token || !delegatee) return
    if (!ethers.isAddress(delegatee)) {
      setStatus('Enter a valid delegate address that starts with 0x.')
      return
    }

    setIsWorking(true)
    setStatus('Delegating voting power...')
    try {
      const tx = await token.delegate(delegatee)
      await tx.wait()
      await refreshTokenState()
      setStatus('Voting power delegated.')
      setDelegatee('')
    } catch (error) {
      console.error('Error delegating votes:', error)
      setStatus('Delegation failed. Check the address and try again.')
    } finally {
      setIsWorking(false)
    }
  }

  const selfDelegateVotes = async () => {
    if (!token || !account) return
    setIsWorking(true)
    setStatus('Self-delegating voting power...')
    try {
      const tx = await token.delegate(account)
      await tx.wait()
      await refreshTokenState()
      setStatus('Voting power delegated to your connected wallet.')
    } catch (error) {
      console.error('Error self-delegating votes:', error)
      setStatus('Self-delegation failed. Confirm MetaMask is on Sepolia and try again.')
    } finally {
      setIsWorking(false)
    }
  }

  const joinDAO = async () => {
    if (!membershipNFT) return
    setIsWorking(true)
    setStatus('Joining DAO membership...')
    try {
      const price = await membershipNFT.mintPrice()
      const tx = await membershipNFT.mint('member.json', { value: price })
      await tx.wait()
      await refreshTokenState()
      setStatus('DAO membership NFT minted.')
    } catch (error) {
      console.error('Error joining DAO:', error)
      setStatus('Join DAO failed. Check Sepolia network, wallet funds, or existing membership.')
    } finally {
      setIsWorking(false)
    }
  }

  const isTokenOwner = Boolean(account && tokenOwner && account.toLowerCase() === tokenOwner.toLowerCase())
  const isSelfDelegated = Boolean(account && delegatedTo.toLowerCase() === account.toLowerCase())
  const activeTitle = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label ?? 'Dashboard', [activeTab])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f3b57_0,#0b1220_34%,#080c14_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-b-[2rem] border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <ShieldCheck size={14} />
              Research governance workspace
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">ResearchDAO</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Submit research, govern treasury actions, review proposals, and build contributor reputation from one wallet-connected console.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Network size={14} />
                Local DAO contracts
              </div>
              <div className="mt-1 font-mono text-sm text-slate-100">{account ? shortAddress(account) : 'Not connected'}</div>
            </div>
            <button
              onClick={connectWallet}
              disabled={isWorking}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWorking ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
              {account ? 'Switch wallet' : 'Connect wallet'}
            </button>
          </div>
        </header>

        {status && (
          <div className="mb-5 rounded-lg border border-cyan-200/20 bg-cyan-200/10 px-4 py-3 text-sm text-cyan-50">
            {status}
          </div>
        )}

        {!account ? (
          <main className="grid flex-1 place-items-center py-16">
            <section className="w-full max-w-2xl rounded-lg border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
              <Landmark className="mx-auto text-cyan-200" size={44} />
              <h2 className="mt-5 text-2xl font-bold text-white">Connect to start governing</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
                The interface is ready for proposals, voting, research submissions, and reputation tracking once your wallet is connected to the deployed network.
              </p>
              <button
                onClick={connectWallet}
                disabled={isWorking}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {isWorking ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
                Connect wallet
              </button>
            </section>
          </main>
        ) : (
          <main className="grid flex-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-5 lg:self-start">
              <nav className="rounded-lg border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-black/20 backdrop-blur">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`group mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition duration-200 last:mb-0 ${
                      activeTab === id
                        ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/20'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </nav>

              <section className="mt-4 rounded-lg border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Wallet power</p>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Balance</p>
                    <p className="text-lg font-bold text-white">{Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} TDT</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Voting power</p>
                    <p className="text-lg font-bold text-cyan-200">{Number(votingPower).toLocaleString(undefined, { maximumFractionDigits: 2 })} TDT</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Token owner</p>
                    <p className="break-all font-mono text-xs text-slate-200">{tokenOwner || 'Loading owner...'}</p>
                  </div>
                </div>
              </section>
            </aside>

            <section className="min-w-0 rounded-lg border border-white/10 bg-slate-950/40 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
              <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Current view</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">{activeTitle}</h2>
                </div>
                <button
                  onClick={refreshTokenState}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  <RefreshCw size={16} />
                  Refresh wallet
                </button>
              </div>

              <div className="animate-[fadeIn_220ms_ease-out]">
                {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
                {activeTab === 'governance' && <Governance />}
                {activeTab === 'research' && (
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <ResearchSubmission provider={provider} account={account} />
                    <ResearchArchive provider={provider} account={account} />
                  </div>
                )}
                {activeTab === 'reputation' && <ReputationBadges provider={provider} account={account} />}
                {activeTab === 'history' && <ProposalHistory />}
                {activeTab === 'token' && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                        <p className="text-sm text-slate-400">Your voting power</p>
                        <p className="mt-2 text-3xl font-bold text-cyan-200">{Number(votingPower).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {isSelfDelegated ? 'Delegated to this wallet.' : 'Self-delegate to activate proposal voting.'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                        <p className="text-sm text-slate-400">Available balance</p>
                        <p className="mt-2 text-3xl font-bold text-white">{Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {isMember ? 'DAO membership active.' : 'Join the DAO to mint your membership NFT.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <button
                        onClick={selfDelegateVotes}
                        disabled={isWorking || isSelfDelegated}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Vote size={17} />
                        {isSelfDelegated ? 'Self-delegated' : 'Self delegate'}
                      </button>
                      <button
                        onClick={joinDAO}
                        disabled={isWorking || isMember}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShieldCheck size={17} />
                        {isMember ? 'Member active' : 'Join DAO'}
                      </button>
                      <button
                        onClick={mintTokens}
                        disabled={isWorking || !isTokenOwner}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                        title={isTokenOwner ? 'Mint demo governance tokens' : `Only ${tokenOwner ? shortAddress(tokenOwner) : 'the token owner'} can mint`}
                      >
                        <Coins size={17} />
                        {isTokenOwner ? 'Mint 1,000 TDT' : 'Owner-only mint'}
                      </button>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                      <label className="text-sm font-semibold text-slate-200" htmlFor="delegatee">Delegate votes</label>
                      <p className="mt-1 text-xs text-slate-400">
                        Current delegate: <span className="font-mono text-slate-200">{shortAddress(delegatedTo)}</span>
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                        <input
                          id="delegatee"
                          value={delegatee}
                          onChange={(e) => setDelegatee(e.target.value)}
                          placeholder="0x..."
                          className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 font-mono text-sm text-white outline-none transition focus:border-cyan-300/70"
                        />
                        <button
                          onClick={delegateVotes}
                          disabled={isWorking || !delegatee}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Vote size={17} />
                          Delegate
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  )
}

export default App
