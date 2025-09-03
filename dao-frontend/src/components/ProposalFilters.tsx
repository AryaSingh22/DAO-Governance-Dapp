import { useState } from 'react';

interface ProposalFiltersProps {
  onFilterChange: (filters: {
    category: number | null;
    status: number | null;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => void;
}

export default function ProposalFilters({ onFilterChange }: ProposalFiltersProps) {
  const [category, setCategory] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = ['All', 'Finance', 'Protocol', 'Community', 'Emergency'];
  const statuses = ['All', 'Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Executed'];

  const handleFilterChange = () => {
    onFilterChange({
      category,
      status,
      search,
      sortBy,
      sortOrder
    });
  };

  const clearFilters = () => {
    setCategory(null);
    setStatus(null);
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
    
    onFilterChange({
      category: null,
      status: null,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Category</label>
          <select
            value={category ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              setCategory(value);
            }}
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            onBlur={handleFilterChange}
          >
            <option value="">All Categories</option>
            {categories.slice(1).map((cat, index) => (
              <option key={index} value={index}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm mb-1">Status</label>
          <select
            value={status ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              setStatus(value);
            }}
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            onBlur={handleFilterChange}
          >
            <option value="">All Statuses</option>
            {statuses.slice(1).map((stat, index) => (
              <option key={index} value={index + 1}>{stat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals..."
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            onBlur={handleFilterChange}
          />
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            onBlur={handleFilterChange}
          >
            <option value="createdAt">Created At</option>
            <option value="forVotes">For Votes</option>
            <option value="againstVotes">Against Votes</option>
            <option value="title">Title</option>
          </select>
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm mb-1">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'asc' | 'desc');
            }}
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            onBlur={handleFilterChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={clearFilters}
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          Clear All Filters
        </button>
        
        <button
          onClick={handleFilterChange}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}