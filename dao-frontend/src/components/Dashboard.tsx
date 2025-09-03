import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { TOKEN_ADDRESS, TOKEN_ABI, TREASURY_ADDRESS, TREASURY_ABI, MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI } from '../config/contracts';

type DAOMetrics = {
  totalTokenSupply: string;
  totalMembers: number;
  treasuryBalance: string;
  activeStreams: number;
  totalStreamsValue: string;
  averageVotingPower: string;
  topHolders: Array<{ address: string; balance: string; percentage: number }>;
};

export default function Dashboard() {
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
    topHolders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((window as any).ethereum) {
      const p = new BrowserProvider((window as any).ethereum);
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

  const loadMetrics = async () => {
    if (!token || !treasury || !membershipNFT) return;
    setLoading(true);

    try {
      // Token metrics
      const totalSupply = await token.totalSupply();
      const treasuryBalance = await provider?.getBalance(TREASURY_ADDRESS) || 0n;
      
      // Membership metrics
      const totalMembers = await membershipNFT.totalSupply();
      
      // Treasury streams (simplified - in real app you'd track all streams)
      const activeStreams = 0; // Would need to iterate through all streams
      const totalStreamsValue = '0'; // Would calculate from active streams
      
      // Voting power metrics
      const averageVotingPower = ethers.formatEther(totalSupply / 10n); // Simplified
      
      // Top holders (simplified - would need to track all holders)
      const topHolders = [
        { address: '0x1234...', balance: ethers.formatEther(totalSupply / 4n), percentage: 25 },
        { address: '0x5678...', balance: ethers.formatEther(totalSupply / 8n), percentage: 12.5 },
        { address: '0x9abc...', balance: ethers.formatEther(totalSupply / 16n), percentage: 6.25 }
      ];

      setMetrics({
        totalTokenSupply: ethers.formatEther(totalSupply),
        totalMembers: Number(totalMembers),
        treasuryBalance: ethers.formatEther(treasuryBalance),
        activeStreams,
        totalStreamsValue,
        averageVotingPower,
        topHolders
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [token, treasury, membershipNFT]);

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

      {/* Token Distribution */}
      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Top Token Holders</h4>
        <div className="space-y-2">
          {metrics.topHolders.map((holder, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-slate-300 font-mono">{holder.address}</span>
              </div>
              <div className="text-right">
                <div className="text-slate-100 font-semibold">{formatNumber(holder.balance)}</div>
                <div className="text-xs text-slate-400">{holder.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
            Mint Tokens
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
            Join DAO
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
            Delegate Votes
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm">
            Claim Stream
          </button>
        </div>
      </div>

      <button onClick={loadMetrics} className="bg-cyan-700 text-white px-4 py-2 rounded">
        Refresh Metrics
      </button>
    </div>
  );
}
