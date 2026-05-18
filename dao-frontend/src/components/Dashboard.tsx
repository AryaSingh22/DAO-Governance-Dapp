import { useEffect, useState, useCallback } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { TOKEN_ADDRESS, TOKEN_ABI, TREASURY_ADDRESS, TREASURY_ABI, MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI } from '../config/contracts';

type DashboardTab = 'governance' | 'research' | 'reputation' | 'history' | 'token';

type DAOMetrics = {
  totalTokenSupply: string;
  totalMembers: number;
  treasuryBalance: string;
  activeStreams: number;
  totalStreamsValue: string;
  averageVotingPower: string;
};

type DashboardProps = {
  onNavigate: (tab: DashboardTab) => void;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [token, setToken] = useState<Contract | null>(null);
  const [treasury, setTreasury] = useState<Contract | null>(null);
  const [membershipNFT, setMembershipNFT] = useState<Contract | null>(null);
  const [metrics, setMetrics] = useState<DAOMetrics>({
    totalTokenSupply: '0',
    totalMembers: 0,
    treasuryBalance: '0',
    activeStreams: 0,
    totalStreamsValue: '0',
    averageVotingPower: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.ethereum) {
      const p = new BrowserProvider(window.ethereum);
      setProvider(p);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!provider) return;
      const signer = await provider.getSigner();
      const t = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const tr = new Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
      const mnft = new Contract(MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI, signer);
      setToken(t);
      setTreasury(tr);
      setMembershipNFT(mnft);
    })();
  }, [provider]);

  const loadMetrics = useCallback(async () => {
    if (!token || !treasury || !membershipNFT) return;
    setLoading(true);

    try {
      // Token metrics
      const totalSupply = await token.totalSupply();
      const treasuryBalance = await provider?.getBalance(TREASURY_ADDRESS) || 0n;

      // Membership metrics
      const totalMembers = await membershipNFT.totalSupply();

      const activeStreams = 0;
      const totalStreamsValue = '0';

      const averageVotingPower = totalMembers > 0n ? ethers.formatEther(totalSupply / totalMembers) : '0';

      setMetrics({
        totalTokenSupply: ethers.formatEther(totalSupply),
        totalMembers: Number(totalMembers),
        treasuryBalance: ethers.formatEther(treasuryBalance),
        activeStreams,
        totalStreamsValue,
        averageVotingPower,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [token, treasury, membershipNFT, provider]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const formatNumber = (num: string) => {
    const n = parseFloat(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toFixed(2);
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-8">
        <h3 className="text-lg font-semibold text-cyan-300">DAO Dashboard</h3>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-300">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold text-cyan-300">DAO Analytics Dashboard</h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-cyan-300">{formatNumber(metrics.totalTokenSupply)}</div>
          <div className="text-sm text-slate-400">Total Token Supply</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.totalMembers}</div>
          <div className="text-sm text-slate-400">Total Members</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-yellow-400">{formatNumber(metrics.treasuryBalance)} ETH</div>
          <div className="text-sm text-slate-400">Treasury Balance</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-purple-400">{formatNumber(metrics.averageVotingPower)}</div>
          <div className="text-sm text-slate-400">Avg Voting Power</div>
        </div>
      </div>

      {/* Treasury Streams */}
      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Treasury Streams</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{metrics.activeStreams}</div>
            <div className="text-sm text-slate-400">Active Streams</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{formatNumber(metrics.totalStreamsValue)} ETH</div>
            <div className="text-sm text-slate-400">Total Stream Value</div>
          </div>
        </div>
      </div>

      {/* Live data coverage */}
      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
        <h4 className="text-lg font-semibold text-slate-100 mb-3">Live Data Coverage</h4>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3">
            <div className="text-sm font-semibold text-cyan-100">On-chain</div>
            <p className="mt-1 text-xs leading-5 text-slate-300">Token supply, membership count, treasury ETH balance, and wallet voting power read directly from Sepolia.</p>
          </div>
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3">
            <div className="text-sm font-semibold text-amber-100">Indexer needed</div>
            <p className="mt-1 text-xs leading-5 text-slate-300">Top holder rankings and all historical streams need an event indexer before they can be shown as complete analytics.</p>
          </div>
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3">
            <div className="text-sm font-semibold text-emerald-100">Demo-ready</div>
            <p className="mt-1 text-xs leading-5 text-slate-300">The buttons below now open the real working screens instead of acting like inactive placeholders.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => onNavigate('token')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition">
            Token Controls
          </button>
          <button onClick={() => onNavigate('research')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition">
            Submit Research
          </button>
          <button onClick={() => onNavigate('governance')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition">
            Governance
          </button>
          <button onClick={() => onNavigate('reputation')} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition">
            Reputation
          </button>
        </div>
      </div>

      <button onClick={loadMetrics} className="bg-cyan-700 text-white px-4 py-2 rounded">
        Refresh Metrics
      </button>
    </div>
  );
}
