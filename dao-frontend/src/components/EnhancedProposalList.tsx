import { useState, useEffect } from 'react';
import ProposalFilters from './ProposalFilters';

interface Proposal {
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
}

interface EnhancedProposalListProps {
  proposals: Proposal[];
  onVote: (id: bigint, support: number) => void;
  onQueue: (proposal: Proposal) => void;
  onExecute: (proposal: Proposal) => void;
}

export default function EnhancedProposalList({ 
  proposals, 
  onVote, 
  onQueue, 
  onExecute 
}: EnhancedProposalListProps) {
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>(proposals);
  const [filters, setFilters] = useState({
    category: null as number | null,
    status: null as number | null,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  useEffect(() => {
    applyFilters();
  }, [proposals, filters]);

  const applyFilters = () => {
    let result = [...proposals];
    
    // Apply category filter
    if (filters.category !== null) {
      result = result.filter(p => p.category === filters.category);
    }
    
    // Apply status filter
    if (filters.status !== null) {
      result = result.filter(p => p.state === filters.status);
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'forVotes':
          aValue = parseFloat(a.forVotes);
          bValue = parseFloat(b.forVotes);
          break;
        case 'againstVotes':
          aValue = parseFloat(a.againstVotes);
          bValue = parseFloat(b.againstVotes);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredProposals(result);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

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

  return (
    <div>
      <ProposalFilters onFilterChange={handleFilterChange} />
      
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="bg-slate-900/70 p-8 rounded-lg border border-slate-800 text-center">
            <p className="text-slate-400">No proposals found matching your filters</p>
          </div>
        ) : (
          filteredProposals.map(p => (
            <div key={p.id.toString()} className="bg-slate-900/70 p-5 rounded-lg border border-slate-800">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-100">{p.title}</h4>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(p.state)}`}>
                      {statusLabel(p.state)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${categoryClass(p.category)}`}>
                      {categoryLabel(p.category)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <div>ID: {p.id.toString().substring(0, 10)}...</div>
                  <div>Created: {formatDate(p.createdAt)}</div>
                </div>
              </div>
              
              <p className="text-slate-300 mb-4">{p.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-800/50 rounded">
                  <div className="text-lg font-semibold text-green-400">{p.forVotes}</div>
                  <div className="text-xs text-slate-400">For Votes</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded">
                  <div className="text-lg font-semibold text-red-400">{p.againstVotes}</div>
                  <div className="text-xs text-slate-400">Against Votes</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded">
                  <div className="text-lg font-semibold text-yellow-400">{p.abstainVotes}</div>
                  <div className="text-xs text-slate-400">Abstain Votes</div>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 mb-4">
                Snapshot: {p.start.toString()} • Deadline: {p.end.toString()}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => onVote(p.id, 1)} 
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Vote For
                </button>
                <button 
                  onClick={() => onVote(p.id, 0)} 
                  className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Vote Against
                </button>
                <button 
                  onClick={() => onVote(p.id, 2)} 
                  className="bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Abstain
                </button>
                {p.state === 4 && (
                  <button 
                    onClick={() => onQueue(p)} 
                    className="bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Queue
                  </button>
                )}
                {p.state === 5 && (
                  <button 
                    onClick={() => onExecute(p)} 
                    className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Execute
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}