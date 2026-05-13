import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import {
  isConfiguredAddress,
  RESEARCH_REGISTRY_ABI,
  RESEARCH_REGISTRY_ADDRESS,
  TOKEN_ABI,
  TOKEN_ADDRESS,
} from '../config/contracts';

interface ResearchSubmissionProps {
  provider: BrowserProvider | null;
  account: string | null;
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

const ResearchSubmission = ({ provider, account }: ResearchSubmissionProps) => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [category, setCategory] = useState('0');
  const [cid, setCid] = useState('');
  const [hash, setHash] = useState('');
  const [submissionFee, setSubmissionFee] = useState<bigint>(0n);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');

  useEffect(() => {
    if (!provider || !isConfiguredAddress(RESEARCH_REGISTRY_ADDRESS)) return;

    const loadFee = async () => {
      try {
        const signer = await provider.getSigner();
        const researchRegistry = new Contract(RESEARCH_REGISTRY_ADDRESS, RESEARCH_REGISTRY_ABI, signer);
        setSubmissionFee(await researchRegistry.submissionFee());
      } catch (error) {
        console.error('Unable to load submission fee:', error);
      }
    };

    loadFee();
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account || !isConfiguredAddress(RESEARCH_REGISTRY_ADDRESS)) {
      setTransactionStatus('Deploy and configure the research registry address before submitting papers.');
      return;
    }

    const hashValue = hash.startsWith('0x') ? hash : `0x${hash}`;
    if (!ethers.isHexString(hashValue, 32)) {
      setTransactionStatus('The paper hash must be a 32-byte hex value.');
      return;
    }

    setIsSubmitting(true);
    setTransactionStatus('Preparing research submission...');

    try {
      const signer = await provider.getSigner();
      const researchRegistry = new Contract(RESEARCH_REGISTRY_ADDRESS, RESEARCH_REGISTRY_ABI, signer);
      const token = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const authorArray = authors.split(',').map((author) => author.trim()).filter(Boolean);

      if (submissionFee > 0n) {
        const allowance = await token.allowance(account, RESEARCH_REGISTRY_ADDRESS);
        if (allowance < submissionFee) {
          setTransactionStatus('Approving submission fee...');
          const approval = await token.approve(RESEARCH_REGISTRY_ADDRESS, submissionFee);
          await approval.wait();
        }
      }

      setTransactionStatus('Submitting research paper...');
      const tx = await researchRegistry.submitPaper(
        cid,
        hashValue,
        title,
        abstract,
        authorArray,
        parseInt(category, 10),
      );

      await tx.wait();
      setTransactionStatus('Research paper submitted successfully.');

      setTitle('');
      setAbstract('');
      setAuthors('');
      setCategory('0');
      setCid('');
      setHash('');
    } catch (error) {
      console.error('Error submitting research paper:', error);
      setTransactionStatus('Submission failed. Check token approval, fee balance, and registry deployment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Research intake</p>
        <h3 className="mt-1 text-xl font-bold text-white">Submit a paper</h3>
        <p className="mt-2 text-sm text-slate-400">
          Fee: {ethers.formatEther(submissionFee)} TDT
        </p>
      </div>

      {!isConfiguredAddress(RESEARCH_REGISTRY_ADDRESS) && (
        <div className="mb-5 rounded-lg border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-50">
          Configure VITE_RESEARCH_REGISTRY_ADDRESS after deployment to enable submissions.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Research paper title"
            className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Abstract</label>
          <textarea
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Research paper abstract"
            rows={5}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">Authors</label>
          <input
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="Author 1, Author 2"
            className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
            >
              {categories.map((cat, index) => (
                <option key={cat} value={index}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">IPFS CID</label>
            <input
              type="text"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="Qm..."
              className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">SHA-256 hash</label>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="0x..."
            className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 font-mono text-sm text-white outline-none transition focus:border-cyan-300/70"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isConfiguredAddress(RESEARCH_REGISTRY_ADDRESS)}
          className="h-11 w-full rounded-lg bg-cyan-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit paper'}
        </button>

        {transactionStatus && (
          <p className="rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm text-slate-300">{transactionStatus}</p>
        )}
      </form>
    </section>
  );
};

export default ResearchSubmission;
