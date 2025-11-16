import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { REPUTATION_MANAGER_ADDRESS, REPUTATION_MANAGER_ABI } from '../config/contracts';

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
  earned: boolean;
}

const ReputationBadges = ({ provider, account }: { provider: any; account: string | null }) => {
  const [reputation, setReputation] = useState<UserReputation>({
    totalPoints: 0,
    submissions: 0,
    votes: 0,
    reviews: 0
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultBadges: Badge[] = [
    { id: 1, name: 'Researcher', description: 'Submitted first research paper', pointsRequired: 100, earned: false },
    { id: 2, name: 'Contributor', description: 'Active community contributor', pointsRequired: 500, earned: false },
    { id: 3, name: 'Expert', description: 'Recognized domain expert', pointsRequired: 1000, earned: false },
    { id: 4, name: 'Visionary', description: 'DAO visionary and leader', pointsRequired: 2000, earned: false }
  ];

  useEffect(() => {
    fetchReputationData();
  }, [account]);

  const fetchReputationData = async () => {
    if (!provider || !account) return;
    
    try {
      const signer = await provider.getSigner();
      const reputationManager = new Contract(REPUTATION_MANAGER_ADDRESS, REPUTATION_MANAGER_ABI, signer);
      
      // In a real implementation, we would fetch actual data
      // For now, we'll use sample data
      const sampleReputation: UserReputation = {
        totalPoints: 350,
        submissions: 2,
        votes: 15,
        reviews: 3
      };
      
      setReputation(sampleReputation);
      
      // Update badges based on points
      const updatedBadges = defaultBadges.map(badge => ({
        ...badge,
        earned: sampleReputation.totalPoints >= badge.pointsRequired
      }));
      
      setBadges(updatedBadges);
      
      // Sample leaderboard data
      const sampleLeaderboard = [
        { address: '0x1234...5678', points: 1250 },
        { address: '0x9876...5432', points: 980 },
        { address: '0xabcd...ef01', points: 760 },
        { address: '0x2468...1357', points: 620 },
        { address: account, points: sampleReputation.totalPoints }
      ].sort((a, b) => b.points - a.points);
      
      setLeaderboard(sampleLeaderboard);
    } catch (error) {
      console.error('Error fetching reputation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-cyan-300">Reputation & Badges</h3>
        <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800">
          <p className="text-slate-300">Loading reputation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-cyan-300">Reputation & Badges</h3>
      
      {/* Reputation Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Total Points</p>
          <p className="text-2xl font-bold text-cyan-300">{reputation.totalPoints}</p>
        </div>
        
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Papers Submitted</p>
          <p className="text-2xl font-bold text-green-400">{reputation.submissions}</p>
        </div>
        
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Votes Cast</p>
          <p className="text-2xl font-bold text-purple-400">{reputation.votes}</p>
        </div>
        
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Reviews</p>
          <p className="text-2xl font-bold text-yellow-400">{reputation.reviews}</p>
        </div>
      </div>
      
      {/* Badges */}
      <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800">
        <h4 className="text-md font-semibold text-cyan-300 mb-4">Your Badges</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`p-4 rounded-lg border ${
                badge.earned 
                  ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-700' 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  badge.earned 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                    : 'bg-slate-700'
                }`}>
                  <span className="text-lg">🏆</span>
                </div>
                
                <div>
                  <h5 className={`font-semibold ${
                    badge.earned ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {badge.name}
                  </h5>
                  <p className={`text-sm ${
                    badge.earned ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {badge.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {badge.earned 
                      ? 'Earned!' 
                      : `${badge.pointsRequired - reputation.totalPoints} points needed`
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-800">
        <h4 className="text-md font-semibold text-cyan-300 mb-4">Leaderboard</h4>
        
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.address === account 
                  ? 'bg-cyan-900/20 border border-cyan-800' 
                  : 'bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-yellow-900' :
                  index === 1 ? 'bg-gray-400 text-gray-900' :
                  index === 2 ? 'bg-amber-800 text-amber-100' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {index + 1}
                </span>
                <span className="font-mono text-sm">
                  {user.address === account ? 'You' : user.address}
                </span>
              </div>
              <span className="font-semibold text-cyan-300">
                {user.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReputationBadges;