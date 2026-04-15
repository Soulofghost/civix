import React from 'react';
import { Award, TrendingUp, Users, ShieldCheck } from 'lucide-react';

const mockTopContributors = [
  { id: 1, name: 'Adarsh P', points: 450, badges: 8, avatar: 'https://i.pravatar.cc/150?u=adarsh' },
  { id: 2, name: 'Saira Paul', points: 380, badges: 5, avatar: 'https://i.pravatar.cc/150?u=saira' },
  { id: 3, name: 'Kevin Joel', points: 310, badges: 3, avatar: 'https://i.pravatar.cc/150?u=kevin' },
];

const mockAuthorities = [
  { id: 1, name: 'PWD Dept Kochi', score: 9.8, resolved: 145 },
  { id: 2, name: 'KWA Ernakulam', score: 9.2, resolved: 89 },
];

export default function Leaderboard({ region }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-panel p-6 border-white/5 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2 text-white">
              <Award className="text-accent" size={20} /> Regional Top Contributors
           </h3>
           <span className="text-[10px] text-textSecondary uppercase font-black">{region}</span>
        </div>
        
        <div className="space-y-4">
           {mockTopContributors.map((user, idx) => (
             <div key={user.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-accent/40 transition-all group">
                <span className={`text-sm font-black w-4 ${idx === 0 ? 'text-accent' : 'text-textSecondary'}`}>#{idx + 1}</span>
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-surface shadow-md" alt={user.name} />
                <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
                   <p className="text-[10px] text-textSecondary uppercase">{user.badges} Badges Unlocked</p>
                </div>
                <div className="text-right">
                   <div className="text-sm font-black text-accent">{user.points}</div>
                   <div className="text-[8px] text-textSecondary uppercase font-bold">Points</div>
                </div>
             </div>
           ))}
        </div>
        
        <button className="w-full py-2 text-[10px] font-black uppercase text-textSecondary hover:text-white transition-colors">View All Citizens</button>
      </div>

      <div className="glass-panel p-6 border-white/5 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2 text-white">
              <ShieldCheck className="text-primary" size={20} /> Active Authorities
           </h3>
           <span className="text-[10px] text-textSecondary uppercase font-black">Performance</span>
        </div>

        <div className="space-y-4">
           {mockAuthorities.map((auth) => (
             <div key={auth.id} className="p-4 rounded-xl bg-surfaceHighlight/30 border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="text-sm font-bold text-white">{auth.name}</h4>
                      <p className="text-[10px] text-textSecondary">{auth.resolved} Issues Resolved</p>
                   </div>
                   <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-xs font-black">
                      {auth.score}/10
                   </div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-gradient-to-r from-primary to-accent h-full shadow-glow" style={{ width: `${auth.score * 10}%` }}></div>
                </div>
             </div>
           ))}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
           <div className="flex items-center gap-3">
              <TrendingUp className="text-accent" />
              <div>
                 <h4 className="text-xs font-black text-white uppercase italic">Territory Cleanliness Score</h4>
                 <p className="text-2xl font-black text-white mt-1">84% <span className="text-xs font-normal text-success ml-1">+2.4% vs last mo</span></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
