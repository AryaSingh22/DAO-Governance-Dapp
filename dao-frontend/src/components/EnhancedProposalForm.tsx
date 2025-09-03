import { useState } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { GOVERNOR_ADDRESS, GOVERNOR_ABI, TREASURY_ADDRESS } from '../config/contracts';

interface EnhancedProposalFormProps {
  provider: BrowserProvider | null;
  account: string | null;
}

export default function EnhancedProposalForm({ provider, account }: EnhancedProposalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(0);
  const [ipfsCID, setIpfsCID] = useState('');
  const [target, setTarget] = useState(TREASURY_ADDRESS);
  const [valueEth, setValueEth] = useState('0');
  const [calldata, setCalldata] = useState('');
  const [votingMode, setVotingMode] = useState(0); // 0 = Standard, 1 = Quadratic
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');

  const categories = ['Finance', 'Protocol', 'Community', 'Emergency'];
  const votingModes = ['Standard', 'Quadratic'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account) return;

    setIsSubmitting(true);
    setError('');
    setTransactionHash('');

    try {
      const signer = await provider.getSigner();
      const governor = new Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, signer);

      // Encode calldata if not provided
      let encodedCalldata = calldata;
      if (!calldata && target === TREASURY_ADDRESS) {
        const treasury = new Contract(TREASURY_ADDRESS, [], signer);
        encodedCalldata = treasury.interface.encodeFunctionData('releaseETH', [
          account,
          0n
        ]);
      }

      // Create proposal with metadata
      const tx = await governor.proposeWithMetadata(
        [target],
        [valueEth ? parseEther(valueEth) : 0n],
        [encodedCalldata],
        title,
        description,
        ipfsCID,
        category,
        votingMode
      );

      const receipt = await tx.wait();
      setTransactionHash(receipt.hash);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory(0);
      setIpfsCID('');
      setTarget(TREASURY_ADDRESS);
      setValueEth('0');
      setCalldata('');
      setVotingMode(0);
    } catch (err: any) {
      setError(err.message || 'Failed to create proposal');
      console.error('Error creating proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800">
      <h3 className="text-xl font-semibold text-cyan-300 mb-4">Create New Proposal</h3>
      
      {transactionHash && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded">
          <p className="text-green-300">Proposal created successfully!</p>
          <p className="text-sm text-slate-400 mt-1">Transaction: {transactionHash}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter proposal title"
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed proposal description"
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            >
              {categories.map((cat, index) => (
                <option key={index} value={index}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-1">Voting Mode</label>
            <select
              value={votingMode}
              onChange={(e) => setVotingMode(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
            >
              {votingModes.map((mode, index) => (
                <option key={index} value={index}>{mode}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm mb-1">IPFS CID (Optional)</label>
          <input
            type="text"
            value={ipfsCID}
            onChange={(e) => setIpfsCID(e.target.value)}
            placeholder="Qm..."
            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
          />
        </div>
        
        <div className="border-t border-slate-700 pt-4 mt-4">
          <h4 className="text-slate-300 font-medium mb-3">Action Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Target Address</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-slate-300 text-sm mb-1">ETH Value (Optional)</label>
              <input
                type="text"
                value={valueEth}
                onChange={(e) => setValueEth(e.target.value)}
                placeholder="0.0"
                className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-slate-300 text-sm mb-1">Calldata (Optional)</label>
            <textarea
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
              placeholder="0x..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded font-mono text-sm"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isSubmitting
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Creating Proposal...' : 'Create Proposal'}
        </button>
      </form>
    </div>
  );
}