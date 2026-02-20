import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

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

const ResearchArchive = ({ provider }: { provider: BrowserProvider | null; account: string | null }) => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'Computer Science',
    'Biology',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Economics',
    'Other'
  ];

  const statusLabels = ['Submitted', 'Approved', 'Rejected'];

  const fetchPapers = useCallback(async () => {
    if (!provider) return;

    try {
      // In a real implementation, we would fetch all papers
      // For now, we'll create sample data
      const samplePapers: ResearchPaper[] = [
        {
          id: 1,
          cid: 'QmExample1',
          hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          title: 'Advancements in Decentralized Governance',
          paperAbstract: 'This paper explores new mechanisms for decentralized decision-making...',
          authors: ['Alice Researcher', 'Bob Scientist'],
          category: 0,
          status: 1,
          submitter: '0x1234...5678',
          submissionTime: Date.now() / 1000,
          proposalId: 101,
          submissionFee: 1000000000000000000n
        },
        {
          id: 2,
          cid: 'QmExample2',
          hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          title: 'Blockchain Scalability Solutions',
          paperAbstract: 'A comprehensive analysis of Layer 2 scaling solutions...',
          authors: ['Charlie Developer'],
          category: 0,
          status: 1,
          submitter: '0x9876...5432',
          submissionTime: Date.now() / 1000 - 86400,
          proposalId: 102,
          submissionFee: 1000000000000000000n
        }
      ];

      setPapers(samplePapers);
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const filteredPapers = papers.filter(paper => {
    const matchesCategory = filterCategory === 'all' || paper.category.toString() === filterCategory;
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-cyan-300">Research Archive</h3>
        <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800">
          <p className="text-slate-300">Loading research papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-cyan-300">Research Archive</h3>

      <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author"
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={index}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {filteredPapers.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No research papers found.</p>
          ) : (
            filteredPapers.map((paper) => (
              <div key={paper.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-cyan-300">{paper.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      by {paper.authors.join(', ')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${paper.status === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                    paper.status === 1 ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                    {statusLabels[paper.status]}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mt-3 line-clamp-2">
                  {paper.paperAbstract}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                    {categories[paper.category]}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    Submitted: {new Date(paper.submissionTime * 1000).toLocaleDateString()}
                  </span>
                  {paper.proposalId > 0 && (
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">
                      Proposal #{paper.proposalId}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <a
                    href={`https://ipfs.io/ipfs/${paper.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    View on IPFS
                  </a>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm text-slate-400">
                    Hash: {paper.hash.substring(0, 10)}...{paper.hash.substring(paper.hash.length - 8)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchArchive;