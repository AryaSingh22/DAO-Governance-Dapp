import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import {
  isConfiguredAddress,
  RESEARCH_REGISTRY_ABI,
  RESEARCH_REGISTRY_ADDRESS,
} from '../config/contracts';

interface ResearchPaper {
  id: number;
  cid: string;
  hash: string;
  title: string;
  paperAbstract: string;
  authors: string[];
  category: number;
  status: number;
  submitter: string;
  submissionTime: number;
  proposalId: number;
  submissionFee: bigint;
}

const categories = [
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Economics',
  'Other',
];

const statusLabels = ['Submitted', 'Approved', 'Rejected'];

const statusClass = (status: number) => [
  'border-amber-300/20 bg-amber-300/10 text-amber-100',
  'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  'border-rose-300/20 bg-rose-300/10 text-rose-100',
][status] || 'border-slate-300/20 bg-slate-300/10 text-slate-100';

const ResearchArchive = ({ provider }: { provider: BrowserProvider | null; account: string | null }) => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchPapers = useCallback(async () => {
    if (!provider || !isConfiguredAddress(RESEARCH_REGISTRY_ADDRESS)) {
      setPapers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const signer = await provider.getSigner();
      const researchRegistry = new Contract(RESEARCH_REGISTRY_ADDRESS, RESEARCH_REGISTRY_ABI, signer);
      const total = Number(await researchRegistry.getTotalPapers());
      const loaded: ResearchPaper[] = [];

      for (let id = 1; id <= total; id += 1) {
        const paper = await researchRegistry.getPaperById(id);
        loaded.push({
          id: Number(paper.id ?? paper[0]),
          cid: paper.cid ?? paper[1],
          hash: paper.hash ?? paper[2],
          title: paper.title ?? paper[3],
          paperAbstract: paper.paperAbstract ?? paper[4],
          authors: [...(paper.authors ?? paper[5])],
          category: Number(paper.category ?? paper[6]),
          status: Number(paper.status ?? paper[7]),
          submitter: paper.submitter ?? paper[8],
          submissionTime: Number(paper.submissionTime ?? paper[9]),
          proposalId: Number(paper.proposalId ?? paper[10]),
          submissionFee: BigInt(paper.submissionFee ?? paper[11]),
        });
      }

      setPapers(loaded.reverse());
    } catch (fetchError) {
      console.error('Error fetching papers:', fetchError);
      setError('Unable to read the research registry on this network.');
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const filteredPapers = useMemo(() => papers.filter((paper) => {
    const term = searchTerm.toLowerCase();
    const matchesCategory = filterCategory === 'all' || paper.category.toString() === filterCategory;
    const matchesSearch = !term ||
      paper.title.toLowerCase().includes(term) ||
      paper.authors.some((author) => author.toLowerCase().includes(term)) ||
      paper.cid.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  }), [papers, filterCategory, searchTerm]);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
        <p className="text-sm text-slate-300">Loading research papers...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Research archive</p>
          <h3 className="mt-1 text-xl font-bold text-white">Submitted papers</h3>
        </div>
        <button onClick={fetchPapers} className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
          Refresh
        </button>
      </div>

      {!isConfiguredAddress(RESEARCH_REGISTRY_ADDRESS) && (
        <div className="mb-5 rounded-lg border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-50">
          Configure VITE_RESEARCH_REGISTRY_ADDRESS after deployment to enable live research reads.
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-rose-200/20 bg-rose-200/10 p-4 text-sm text-rose-50">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search title, author, or CID"
          className="h-11 rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-11 rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
        >
          <option value="all">All categories</option>
          {categories.map((cat, index) => (
            <option key={cat} value={index}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
            No research papers found for this filter.
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <article key={paper.id} className="rounded-lg border border-white/10 bg-slate-950/45 p-4 transition duration-200 hover:border-cyan-200/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">{paper.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">by {paper.authors.join(', ') || 'Unknown author'}</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(paper.status)}`}>
                  {statusLabels[paper.status] ?? 'Unknown'}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{paper.paperAbstract}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-cyan-100">{categories[paper.category] ?? 'Other'}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">
                  Submitted {paper.submissionTime ? new Date(paper.submissionTime * 1000).toLocaleDateString() : 'recently'}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">
                  Fee {ethers.formatEther(paper.submissionFee)} TDT
                </span>
                {paper.proposalId > 0 && <span className="rounded-full bg-indigo-300/10 px-3 py-1 text-indigo-100">Proposal #{paper.proposalId}</span>}
              </div>

              <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <a href={`https://ipfs.io/ipfs/${paper.cid}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-200 hover:text-cyan-100">
                  View IPFS artifact
                </a>
                <span className="font-mono">{paper.hash.slice(0, 12)}...{paper.hash.slice(-8)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default ResearchArchive;
