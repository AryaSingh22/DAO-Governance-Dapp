import { useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { GOVERNOR_ADDRESS, GOVERNOR_ABI, TREASURY_ADDRESS, TREASURY_ABI } from '../config/contracts';

type Proposal = {
  id: bigint;
  description: string;
  state: number; // 0 Pending,1 Active,2 Canceled,3 Defeated,4 Succeeded,5 Queued,6 Expired,7 Executed
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  start: bigint;
  end: bigint;
};

export default function Governance() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [governor, setGovernor] = useState<Contract | null>(null);
  const [treasury, setTreasury] = useState<Contract | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [desc, setDesc] = useState('Transfer 0.01 ETH from Treasury to me');
  const [valueEth, setValueEth] = useState('0.01');
  const [target, setTarget] = useState(TREASURY_ADDRESS);
  const [calldata, setCalldata] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

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
      try {
        const addr = await signer.getAddress();
        setAccount(addr);
      } catch {}
      const gov = new Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, signer);
      const tre = new Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
      setGovernor(gov);
      setTreasury(tre);
    })();
  }, [provider]);

  useEffect(() => {
    if (!treasury) return;
    const iface = treasury.interface;
    const data = iface.encodeFunctionData('releaseETH', [account ?? ethers.ZeroAddress, 0n]);
    setCalldata(data);
  }, [treasury, account]);

  const createProposal = async () => {
    if (!governor) return;
    const targets = [target];
    const values = [ethers.parseEther(valueEth)];
    const calldatas = [calldata];
    const tx = await governor.propose(targets, values, calldatas, desc);
    await tx.wait();
    await refresh();
  };

  const castVote = async (id: bigint, support: number) => {
    if (!governor) return;
    const tx = await governor.castVote(id, support);
    await tx.wait();
  };

  const refresh = async () => {
    if (!governor) return;
    const filter = governor.filters.ProposalCreated();
    const events = await governor.queryFilter(filter, 0n);
    const list: Proposal[] = [];
    for (const ev of events) {
      const id = ev.args?.proposalId as bigint;
      const description = ev.args?.description as string;
      const [againstVotes, forVotes, abstainVotes] = await governor.proposalVotes(id);
      const state = await governor.state(id);
      const start = await governor.proposalSnapshot(id);
      const end = await governor.proposalDeadline(id);
      list.push({
        id,
        description,
        state: Number(state),
        forVotes: ethers.formatEther(forVotes),
        againstVotes: ethers.formatEther(againstVotes),
        abstainVotes: ethers.formatEther(abstainVotes),
        start,
        end,
      });
    }
    setProposals(list.reverse());
  };

  useEffect(() => { refresh(); }, [governor, refreshKey]);

  // live updates via events
  useEffect(() => {
    if (!governor) return;
    const onAny = () => setRefreshKey(k => k + 1);
    governor.on('ProposalCreated', onAny);
    governor.on('VoteCast', onAny);
    governor.on('ProposalQueued', onAny);
    governor.on('ProposalExecuted', onAny);
    governor.on('ProposalCanceled', onAny);
    return () => {
      try {
        governor.off('ProposalCreated', onAny);
        governor.off('VoteCast', onAny);
        governor.off('ProposalQueued', onAny);
        governor.off('ProposalExecuted', onAny);
        governor.off('ProposalCanceled', onAny);
      } catch {}
    };
  }, [governor]);

  const queue = async (p: Proposal) => {
    if (!governor) return;
    const descriptionHash = ethers.id(p.description);
    const targets = [target];
    const values = [ethers.parseEther(valueEth)];
    const calldatas = [calldata];
    const tx = await governor.queue(targets, values, calldatas, descriptionHash);
    await tx.wait();
  };

  const execute = async (p: Proposal) => {
    if (!governor) return;
    const descriptionHash = ethers.id(p.description);
    const targets = [target];
    const values = [ethers.parseEther(valueEth)];
    const calldatas = [calldata];
    const tx = await governor.execute(targets, values, calldatas, descriptionHash);
    await tx.wait();
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

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold text-cyan-300">Governance</h3>
      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target address" className="bg-slate-950 border border-slate-700 text-white px-2 py-2 rounded" />
          <input value={valueEth} onChange={e=>setValueEth(e.target.value)} placeholder="ETH value" className="bg-slate-950 border border-slate-700 text-white px-2 py-2 rounded" />
          <textarea value={calldata} onChange={e=>setCalldata(e.target.value)} placeholder="Calldata (0x...)" className="bg-slate-950 border border-slate-700 text-white px-2 py-2 rounded md:col-span-2" />
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="bg-slate-950 border border-slate-700 text-white px-2 py-2 rounded md:col-span-2" />
        </div>
        <button onClick={createProposal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Create Proposal</button>
      </div>

      <div className="space-y-4">
        {proposals.map(p => (
          <div key={p.id.toString()} className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <div>
                <p className="text-slate-400 text-xs">ID</p>
                <p className="font-mono text-slate-100">{p.id.toString()}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(p.state)}`}>{statusLabel(p.state)}</span>
              </div>
            </div>
            <p className="text-slate-200 mt-2">{p.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-slate-300">
              <div>For: {p.forVotes}</div>
              <div>Against: {p.againstVotes}</div>
              <div>Abstain: {p.abstainVotes}</div>
            </div>
            <div className="text-slate-400 text-xs mt-1">Snapshot: {p.start.toString()} • Deadline: {p.end.toString()}</div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => castVote(p.id, 1)} className="bg-green-700 text-white px-3 py-1 rounded">Vote For</button>
              <button onClick={() => castVote(p.id, 0)} className="bg-red-700 text-white px-3 py-1 rounded">Vote Against</button>
              <button onClick={() => castVote(p.id, 2)} className="bg-yellow-700 text-white px-3 py-1 rounded">Abstain</button>
              {p.state === 4 && (
                <button onClick={() => queue(p)} className="bg-indigo-700 text-white px-3 py-1 rounded">Queue</button>
              )}
              {p.state === 5 && (
                <button onClick={() => execute(p)} className="bg-purple-700 text-white px-3 py-1 rounded">Execute</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={refresh} className="bg-cyan-700 text-white px-4 py-2 rounded">Refresh</button>
    </div>
  );
}


