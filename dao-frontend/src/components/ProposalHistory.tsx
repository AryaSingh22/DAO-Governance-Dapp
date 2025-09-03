import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { GOVERNOR_ADDRESS, GOVERNOR_ABI } from '../config/contracts';

type ProposalHistory = {
  id: bigint;
  title: string;
  description: string;
  category: number;
  state: number;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  start: bigint;
  end: bigint;
  createdAt: number;
  executed: boolean;
  canceled: boolean;
};

type Analytics = {
  totalProposals: number;
  executedProposals: number;
  defeatedProposals: number;
  activeProposals: number;
  averageParticipation: number;
  totalVotes: number;
};

export default function ProposalHistory() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [governor, setGovernor] = useState<Contract | null>(null);
  const [proposals, setProposals] = useState<ProposalHistory[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalProposals: 0,
    executedProposals: 0,
    defeatedProposals: 0,
    activeProposals: 0,
    averageParticipation: 0,
    totalVotes: 0
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
      const gov = new Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, signer);
      setGovernor(gov);
    })();
  }, [provider]);

  const loadProposals = async () => {
    if (!governor) return;
    setLoading(true);

    try {
      const filter = governor.filters.ProposalCreated();
      const events = await governor.queryFilter(filter, 0n);
      const list: ProposalHistory[] = [];

      for (const ev of events) {
        const id = ev.args?.proposalId as bigint;
        const description = ev.args?.description as string;
        const [againstVotes, forVotes, abstainVotes] = await governor.proposalVotes(id);
        const state = await governor.state(id);
        const start = await governor.proposalSnapshot(id);
        const end = await governor.proposalDeadline(id);
        
        // Get metadata if available
        let title = `Proposal ${id.toString()}`;
        let category = 0;
        let createdAt = 0;
        let executed = false;
        let canceled = false;

        try {
          const metadata = await governor.getProposalMetadata(id);
          title = metadata.title || title;
          category = Number(metadata.category);
          createdAt = Number(metadata.createdAt);
          executed = metadata.executed;
          canceled = metadata.canceled;
        } catch (e) {
          // Metadata not available, use defaults
        }

        list.push({
          id,
          title,
          description,
          category,
          state: Number(state),
          forVotes: ethers.formatEther(forVotes),
          againstVotes: ethers.formatEther(againstVotes),
          abstainVotes: ethers.formatEther(abstainVotes),
          start,
          end,
          createdAt,
          executed,
          canceled
        });
      }

      setProposals(list.reverse());
      calculateAnalytics(list);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (proposalList: ProposalHistory[]) => {
    const total = proposalList.length;
    const executed = proposalList.filter(p => p.state === 7).length;
    const defeated = proposalList.filter(p => p.state === 3).length;
    const active = proposalList.filter(p => p.state === 1).length;
    
    const totalVotes = proposalList.reduce((sum, p) => {
      return sum + parseFloat(p.forVotes) + parseFloat(p.againstVotes) + parseFloat(p.abstainVotes);
    }, 0);

    const avgParticipation = total > 0 ? totalVotes / total : 0;

    setAnalytics({
      totalProposals: total,
      executedProposals: executed,
      defeatedProposals: defeated,
      activeProposals: active,
      averageParticipation: avgParticipation,
      totalVotes: totalVotes
    });
  };

  useEffect(() => {
    loadProposals();
  }, [governor]);

  const statusLabel = (s: number) => {
    const map: Record<number,string> = {
      0: 'Pending', 1: 'Active', 2: 'Canceled', 3: 'Defeated', 4: 'Succeeded', 5: 'Queued', 6: 'Expired', 7: 'Executed'
    };
    return map[s] ?? String(s);
  };

  const statusClass = (s: number) => {
    return [
      'bg-slate-700 text-slate-200',
      'bg-blue-600 text-white',
      'bg-gray-600 text-white',
      'bg-red-700 text-white',
      'bg-green-700 text-white',
      'bg-yellow-600 text-white',
      'bg-orange-600 text-white',
      'bg-emerald-700 text-white'
    ][s] || 'bg-slate-700 text-slate-200';
  };

  const categoryLabel = (c: number) => {
    const categories = ['Finance', 'Protocol', 'Community', 'Emergency'];
    return categories[c] || 'Unknown';
  };

  const categoryClass = (c: number) => {
    const classes = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-red-600'];
    return classes[c] || 'bg-gray-600';
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-8">
        <h3 className="text-lg font-semibold text-cyan-300">Proposal History</h3>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-300">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold text-cyan-300">Proposal History & Analytics</h3>
      
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-cyan-300">{analytics.totalProposals}</div>
          <div className="text-sm text-slate-400">Total Proposals</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-green-400">{analytics.executedProposals}</div>
          <div className="text-sm text-slate-400">Executed</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-red-400">{analytics.defeatedProposals}</div>
          <div className="text-sm text-slate-400">Defeated</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-blue-400">{analytics.activeProposals}</div>
          <div className="text-sm text-slate-400">Active</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-yellow-400">{analytics.averageParticipation.toFixed(1)}</div>
          <div className="text-sm text-slate-400">Avg Participation</div>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-bold text-purple-400">{analytics.totalVotes.toFixed(0)}</div>
          <div className="text-sm text-slate-400">Total Votes</div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map(p => (
          <div key={p.id.toString()} className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-100">{p.title}</h4>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(p.state)}`}>
                    {statusLabel(p.state)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${categoryClass(p.category)}`}>
                    {categoryLabel(p.category)}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>ID: {p.id.toString()}</div>
                <div>Created: {formatDate(p.createdAt)}</div>
              </div>
            </div>
            
            <p className="text-slate-300 mb-3">{p.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400">{p.forVotes}</div>
                <div className="text-xs text-slate-400">For Votes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-400">{p.againstVotes}</div>
                <div className="text-xs text-slate-400">Against Votes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-400">{p.abstainVotes}</div>
                <div className="text-xs text-slate-400">Abstain Votes</div>
              </div>
            </div>
            
            <div className="text-xs text-slate-400">
              Snapshot: {p.start.toString()} • Deadline: {p.end.toString()}
            </div>
          </div>
        ))}
      </div>

      <button onClick={loadProposals} className="bg-cyan-700 text-white px-4 py-2 rounded">
        Refresh History
      </button>
    </div>
  );
}
