import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import {
  isConfiguredAddress,
  REPUTATION_MANAGER_ABI,
  REPUTATION_MANAGER_ADDRESS,
} from '../config/contracts';

interface UserReputation {
  totalPoints: number;
  submissions: number;
  votes: number;
  reviews: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  tokenURI: string;
  earned: boolean;
}

const fallbackBadges: Badge[] = [
  { id: 1, name: 'Researcher', description: 'Submitted first research paper', pointsRequired: 100, tokenURI: 'researcher.json', earned: false },
  { id: 2, name: 'Contributor', description: 'Active community contributor', pointsRequired: 500, tokenURI: 'contributor.json', earned: false },
  { id: 3, name: 'Expert', description: 'Recognized domain expert', pointsRequired: 1000, tokenURI: 'expert.json', earned: false },
  { id: 4, name: 'Visionary', description: 'DAO visionary and leader', pointsRequired: 2000, tokenURI: 'visionary.json', earned: false },
];

const emptyReputation = {
  totalPoints: 0,
  submissions: 0,
  votes: 0,
  reviews: 0,
};

const ReputationBadges = ({ provider, account }: { provider: BrowserProvider | null; account: string | null }) => {
  const [reputation, setReputation] = useState<UserReputation>(emptyReputation);
  const [badges, setBadges] = useState<Badge[]>(fallbackBadges);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReputationData = useCallback(async () => {
    if (!provider || !account || !isConfiguredAddress(REPUTATION_MANAGER_ADDRESS)) {
      setReputation(emptyReputation);
      setBadges(fallbackBadges);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const signer = await provider.getSigner();
      const reputationManager = new Contract(REPUTATION_MANAGER_ADDRESS, REPUTATION_MANAGER_ABI, signer);
      const [totalPoints, submissions, votes, reviews] = await reputationManager.getUserReputation(account);
      const earnedBadgeIds = new Set((await reputationManager.getUserBadges(account)).map((id: bigint) => Number(id)));

      const loadedBadges = await Promise.all(fallbackBadges.map(async (fallback) => {
        try {
          const details = await reputationManager.getBadgeDetails(fallback.id);
          return {
            id: fallback.id,
            name: details.name ?? details[0],
            description: details.description ?? details[1],
            pointsRequired: Number(details.pointsRequired ?? details[2]),
            tokenURI: details.tokenURI ?? details[3],
            earned: earnedBadgeIds.has(fallback.id),
          };
        } catch {
          return {
            ...fallback,
            earned: earnedBadgeIds.has(fallback.id),
          };
        }
      }));

      setReputation({
        totalPoints: Number(totalPoints),
        submissions: Number(submissions),
        votes: Number(votes),
        reviews: Number(reviews),
      });
      setBadges(loadedBadges);
    } catch (fetchError) {
      console.error('Error fetching reputation data:', fetchError);
      setError('Unable to read the reputation manager on this network.');
    } finally {
      setLoading(false);
    }
  }, [provider, account]);

  useEffect(() => {
    fetchReputationData();
  }, [fetchReputationData]);

  const progress = useMemo(() => {
    const nextBadge = badges.find((badge) => !badge.earned);
    if (!nextBadge) return 100;
    return Math.min(100, Math.round((reputation.totalPoints / nextBadge.pointsRequired) * 100));
  }, [badges, reputation.totalPoints]);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
        <p className="text-sm text-slate-300">Loading reputation data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isConfiguredAddress(REPUTATION_MANAGER_ADDRESS) && (
        <div className="rounded-lg border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-50">
          Configure VITE_REPUTATION_MANAGER_ADDRESS after deployment to enable live points and badges.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200/20 bg-rose-200/10 p-4 text-sm text-rose-50">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Contributor reputation</p>
            <h3 className="mt-1 text-3xl font-bold text-white">{reputation.totalPoints.toLocaleString()} pts</h3>
          </div>
          <button onClick={fetchReputationData} className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
            Refresh
          </button>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-900">
          <div className="h-full rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Papers submitted', reputation.submissions, 'text-emerald-200'],
          ['Votes cast', reputation.votes, 'text-indigo-200'],
          ['Reviews', reputation.reviews, 'text-amber-200'],
          ['Badges earned', badges.filter((badge) => badge.earned).length, 'text-cyan-200'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
        <h4 className="text-lg font-bold text-white">Badge ladder</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {badges.map((badge) => {
            const remaining = Math.max(0, badge.pointsRequired - reputation.totalPoints);
            return (
              <article
                key={badge.id}
                className={`rounded-lg border p-4 transition duration-200 ${
                  badge.earned
                    ? 'border-cyan-200/30 bg-cyan-200/10'
                    : 'border-white/10 bg-slate-950/45'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-white">{badge.name}</h5>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{badge.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.earned ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                    {badge.earned ? 'Earned' : `${remaining} left`}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{badge.pointsRequired.toLocaleString()} point threshold</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ReputationBadges;
