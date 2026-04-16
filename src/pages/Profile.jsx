import React, { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useComplaintStore } from '../store/useComplaintStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { 
  User, Mail, Shield, MapPin, Award, Zap, History, 
  Settings, Camera, Edit3, ShieldCheck, CheckCircle, 
  Clock, AlertTriangle, ArrowUpCircle, MessageCircle,
  TrendingUp, BarChart3, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuthStore();
  const { complaints, userKarma } = useComplaintStore();
  const { t } = useLanguageStore();

  const userComplaints = useMemo(() => 
    complaints.filter(c => c.userId === user.id),
  [complaints, user.id]);

  const stats = [
    { label: 'Reports Filed', value: userComplaints.length || 0, icon: <History />, color: 'text-purple-400' },
    { label: 'Resolved', value: userComplaints.filter(c => c.status === 'Resolved').length || 0, icon: <CheckCircle />, color: 'text-emerald-400' },
    { label: 'Karma Points', value: userKarma || 1560, icon: <Award />, color: 'text-amber-400' },
    { label: 'Reliability', value: '98%', icon: <TrendingUp />, color: 'text-blue-400' },
  ];

  const milestones = [
    { name: 'Alpha Citizen', progress: 100, color: 'bg-emerald-500', icon: <ShieldCheck size={12} /> },
    { name: 'Regional Sentinel', progress: 74, color: 'bg-purple-600', icon: <MapPin size={12} /> },
    { name: 'Issue Decipher', progress: 42, color: 'bg-blue-500', icon: <Zap size={12} /> },
    { name: 'Grid Master', progress: 15, color: 'bg-amber-500', icon: <Star size={12} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-jakarta animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 md:p-10 border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 bg-surface">
              <img 
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.display_name}&background=8A2BE2&color=fff&size=200`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-[#0A0B10]">
               <ShieldCheck size={16} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-bold uppercase tracking-tight">{user?.display_name}</h1>
                  <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                     {user?.role}
                  </span>
               </div>
               <p className="text-white/40 text-sm flex items-center justify-center md:justify-start gap-2">
                 <Mail size={14} /> {user?.email}
               </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                  <MapPin size={14} className="text-rose-500" />
                  <span>{user?.region?.city || 'Kochi'}, {user?.region?.state || 'Kerala'}</span>
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                  <Shield size={14} className="text-blue-500" />
                  <span>ID: {user?.id?.slice(0, 8) || 'CTZN-01'}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 glass-panel px-8 py-4 border-white/5">
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">Rank Progression</span>
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-purple-600/20 border-t-purple-500 flex items-center justify-center">
                   <span className="text-xl font-bold">LV2</span>
                </div>
                <div>
                   <p className="text-sm font-bold">Elite Citizen</p>
                   <p className="text-[10px] text-white/40 uppercase font-bold">440 XP to Level 3</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* NEW: Detailed Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <div className="glass-panel p-8 border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-purple-500" />
                    <h2 className="text-lg font-bold uppercase tracking-tight">Active Progression</h2>
                 </div>
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Percentile: Top 4%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {milestones.map((m, i) => (
                   <div key={i} className="space-y-3 p-4 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-center mb-1">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${m.color}/10 ${m.color.replace('bg-', 'text-')}`}>
                               {m.icon}
                            </div>
                            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{m.name}</span>
                         </div>
                         <span className="text-[10px] font-bold text-white/40">{m.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${m.progress}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           className={`h-full ${m.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                         />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between bg-purple-600/10 p-4 rounded-2xl border border-purple-500/20">
                    <div className="flex items-center gap-3 text-purple-400">
                       <Zap size={20} />
                       <p className="text-[10px] font-bold uppercase tracking-widest">Daily Streak: 12 Days Synchronized</p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">+150 Karma Bonus</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Stats Summary */}
          <div className="glass-panel p-6 border-white/5 space-y-6">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Contribution Stats</h3>
             <div className="space-y-4">
                {stats.map((s, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`text-sm ${s.color}`}>{s.icon}</div>
                         <span className="text-xs font-bold text-white/60">{s.label}</span>
                      </div>
                      <span className="text-sm font-bold">{s.value}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="glass-panel p-6 border-white/5 space-y-4 text-center">
             <Settings size={24} className="mx-auto text-white/20" />
             <h4 className="text-[10px] font-bold uppercase tracking-widest">Protocol Settings</h4>
             <button className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-[9px] font-bold uppercase tracking-widest transition-all">
                Update Security Token
             </button>
          </div>
        </div>
      </div>

      {/* Filing History (Simplified) */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-3">
               <History size={20} className="text-rose-500" /> Recent Ledgers
            </h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userComplaints.slice(0, 4).map((c) => (
              <div key={c.id} className="glass-panel p-4 border-white/5 hover:bg-white/5 transition-all flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                     <img src={c.attachments?.[0] || 'https://images.unsplash.com/photo-1518135839073-427c945a6c66?auto=format&fit=crop&w=100'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${c.status === 'Resolved' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                           {c.status}
                        </span>
                     </div>
                     <h4 className="font-bold text-sm truncate uppercase">{c.title}</h4>
                  </div>
                  <ArrowUpCircle size={14} className="text-white/20" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
