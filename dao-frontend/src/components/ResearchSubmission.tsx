import { useState } from 'react';
import { Contract } from 'ethers';
import { RESEARCH_REGISTRY_ADDRESS, RESEARCH_REGISTRY_ABI } from '../config/contracts';

interface ResearchSubmissionProps {
  provider: any;
  account: string | null;
}

const ResearchSubmission = ({ provider, account }: ResearchSubmissionProps) => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [category, setCategory] = useState('0');
  const [cid, setCid] = useState('');
  const [hash, setHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');

  const categories = [
    'Computer Science',
    'Biology',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Economics',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account) return;

    setIsSubmitting(true);
    setTransactionStatus('Submitting research paper...');

    try {
      const signer = await provider.getSigner();
      const researchRegistry = new Contract(RESEARCH_REGISTRY_ADDRESS, RESEARCH_REGISTRY_ABI, signer);
      
      // Split authors by comma
      const authorArray = authors.split(',').map(author => author.trim());
      
      // Convert hash string to bytes32
      const hashBytes32 = `0x${hash.startsWith('0x') ? hash.slice(2) : hash}`;
      
      const tx = await researchRegistry.submitPaper(
        cid,
        hashBytes32,
        title,
        abstract,
        authorArray,
        parseInt(category)
      );
      
      setTransactionStatus('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      setTransactionStatus('Research paper submitted successfully!');
      
      // Reset form
      setTitle('');
      setAbstract('');
      setAuthors('');
      setCategory('0');
      setCid('');
      setHash('');
    } catch (error) {
      console.error('Error submitting research paper:', error);
      setTransactionStatus('Error submitting research paper. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-cyan-300">Submit Research Paper</h3>
      
      <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Research paper title"
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-2">Abstract</label>
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Research paper abstract"
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-2">Authors (comma separated)</label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Author 1, Author 2, Author 3"
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
            >
              {categories.map((cat, index) => (
                <option key={index} value={index}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">IPFS CID</label>
              <input
                type="text"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                placeholder="Qm..."
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-slate-300 text-sm mb-2">SHA256 Hash</label>
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded"
                required
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Research Paper'}
            </button>
          </div>
          
          {transactionStatus && (
            <div className="pt-4">
              <p className="text-slate-300 text-sm">{transactionStatus}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResearchSubmission;