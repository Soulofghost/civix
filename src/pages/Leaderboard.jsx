import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, ShieldAlert, TrendingUp, Search, User } from 'lucide-react';
import { useLanguageStore } from '../store/useLanguageStore';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguageStore();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, points, role')
      .order('points', { ascending: false })
      .limit(50);

    if (!error) {
      setLeaders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-jakarta">
      {/* Header */}
      <div className="glass-panel p-8 md:p-12 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-10 transition-opacity pointer-events-none">
           <Trophy size={160} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <div className="p-5 bg-amber-500/20 rounded-[2rem] border border-amber-500/30">
                <Trophy className="text-amber-500" size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">{t('leaderboard')}</h1>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Honoring our most active community members</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Global Pool</p>
                <p className="text-xl font-black text-white italic">12,840 Citizens</p>
             </div>
             <div className="w-px h-10 bg-white/10 hidden sm:block" />
             <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-10 h-10 rounded-full border-4 border-[#0A0B10]" />
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaders.slice(0, 3).map((citizen, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-panel p-8 border-white/5 relative group transition-all hover:scale-[1.02] ${
              idx === 0 ? 'bg-gradient-to-br from-amber-500/10 to-transparent' : 
              idx === 1 ? 'bg-gradient-to-br from-slate-400/10 to-transparent' : 
              'bg-gradient-to-br from-orange-400/10 to-transparent'
            }`}
          >
            <div className="absolute top-4 right-4 text-4xl font-black italic opacity-20 tracking-tighter group-hover:opacity-40 transition-all">
               #{idx + 1}
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition ${
                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-orange-400'
                }`}></div>
                <img 
                  src={citizen.avatar_url || `https://ui-avatars.com/api/?name=${citizen.display_name}&background=8A2BE2&color=fff`} 
                  className="w-24 h-24 rounded-[2rem] border-2 border-white/10 relative z-10" 
                />
                <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-surface border-2 border-white/5 shadow-xl">
                   {idx === 0 ? <Trophy size={16} className="text-amber-500" /> : <Medal size={16} className={idx === 1 ? "text-slate-400" : "text-orange-400"} />}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase italic tracking-tight truncate max-w-[180px]">{citizen.display_name}</h3>
                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{citizen.role} Node</p>
              </div>
              <div className="px-6 py-2 bg-white/5 rounded-2xl border border-white/5 text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                 {citizen.points || 0} pts
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full List */}
      <div className="glass-panel border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-500" size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Global Rankings</h3>
           </div>
           <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input type="text" placeholder="Find Citizen..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500 transition-all font-medium" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Rank</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Citizen</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Activity Score</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan={5} className="px-8 py-6 h-12 bg-white/5" />
                  </tr>
                ))
              ) : leaders.slice(3).map((citizen, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <span className="text-sm font-black italic opacity-20 transition-opacity group-hover:opacity-40">#{i + 4}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={citizen.avatar_url || `https://ui-avatars.com/api/?name=${citizen.display_name}&background=8A2BE2&color=fff`} 
                        className="w-10 h-10 rounded-xl border border-white/10" 
                      />
                      <span className="text-sm font-bold uppercase italic tracking-tight">{citizen.display_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs text-white/40 font-bold uppercase tracking-widest">{citizen.role}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-purple-500" />
                      <span className="font-bold text-white">{citizen.points || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase">
                       <TrendingUp size={10} /> +{Math.floor(Math.random() * 50)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
