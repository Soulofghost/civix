import React, { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useComplaintStore } from '../store/useComplaintStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { 
  User, Mail, Shield, MapPin, Award, Zap, History, 
  Settings, Camera, Edit3, ShieldCheck, CheckCircle, 
  Clock, AlertTriangle, ArrowUpCircle, MessageCircle
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
    { label: 'Total Reports', value: userComplaints.length, icon: <History />, color: 'text-purple-400' },
    { label: 'Resolved Issues', value: userComplaints.filter(c => c.status === 'Resolved').length, icon: <CheckCircle />, color: 'text-emerald-400' },
    { label: 'Citizen Karma', value: userKarma, icon: <Award />, color: 'text-amber-400' },
    { label: 'Helpfulness', value: '88%', icon: <Zap />, color: 'text-blue-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 font-jakarta">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 md:p-12 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
           <User size={300} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group/avatar">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2.5rem] blur opacity-25 group-hover/avatar:opacity-50 transition duration-1000"></div>
            <div className="relative w-40 h-40 rounded-[2.2rem] overflow-hidden border-2 border-white/10 bg-surface">
              <img 
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.display_name}&background=8A2BE2&color=fff&size=200`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
              <button className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white">
                 <Camera size={16} /> Change
              </button>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-[#0A0B10] shadow-xl">
               <ShieldCheck size={20} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase">{user?.display_name}</h1>
                  <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
                     {user?.role} Node
                  </span>
               </div>
               <p className="text-white/40 font-medium flex items-center justify-center md:justify-start gap-2">
                 <Mail size={14} className="text-purple-500" /> {user?.email}
               </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <MapPin size={14} className="text-rose-500" />
                  <span className="text-xs font-bold text-white/60">{user?.region?.city || 'Kochi'}, {user?.region?.state || 'Kerala'}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <Shield size={14} className="text-blue-500" />
                  <span className="text-xs font-bold text-white/60">ID: {user?.id?.slice(0, 8)}</span>
               </div>
            </div>

            <div className="flex justify-center md:justify-start gap-3 pt-2">
               {user?.badges?.map((badge, i) => (
                 <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <Award size={10} /> {badge}
                 </span>
               ))}
            </div>
          </div>

          <div className="hidden lg:block h-32 w-[1px] bg-white/10 mx-6"></div>

          <div className="flex flex-col items-center gap-2">
             <div className="text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Reputation Score</p>
                <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20 tracking-tighter">
                   {userKarma}
                </div>
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all italic mt-2">
                <Edit3 size={14} className="text-purple-500" /> Edit Soul Token
             </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 border-white/5 group hover:border-white/10 transition-all"
          >
            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 ${s.color}`}>
              {React.cloneElement(s.icon, { size: 24 })}
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter">{s.value}</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Experience & Settings */}
        <div className="space-y-8">
           <div className="glass-panel p-8 border-white/5 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                 <Settings size={18} className="text-purple-500" /> Control Matrix
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Push Notifications', active: true },
                   { label: 'Anonymous Identity', active: false },
                   { label: 'Public Profile Sync', active: true },
                   { label: 'Biometric Protocol', active: true },
                 ].map((opt, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs font-bold text-white/60">{opt.label}</span>
                      <div className={`w-10 h-5 rounded-full relative transition-all ${opt.active ? 'bg-purple-600' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${opt.active ? 'right-1' : 'left-1'}`} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-panel p-8 border-white/5 bg-gradient-to-br from-purple-600/5 to-transparent">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-6">
                 <Award size={18} className="text-amber-500" /> Milestone Grid
              </h3>
              <div className="space-y-6">
                 {[
                   { name: 'Alpha Citizen', progress: 100, color: 'bg-emerald-500' },
                   { name: 'Regional Sentinel', progress: 74, color: 'bg-purple-600' },
                   { name: 'Issue Decipher', progress: 42, color: 'bg-blue-500' },
                 ].map((m, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white/40">{m.name}</span>
                         <span className="text-white">{m.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${m.color}`} style={{ width: `${m.progress}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* User Grievance Ledger */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                 <History size={24} className="text-purple-500" /> Filing History
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                 View Global Ledger
              </button>
           </div>

           <div className="space-y-4">
              {userComplaints.length > 0 ? userComplaints.map((c) => (
                <div key={c.id} className="glass-panel p-6 border-white/5 hover:bg-white/5 transition-all group flex items-start gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 bg-surface shrink-0">
                       <img src={c.attachments?.[0] || 'https://images.unsplash.com/photo-1518135839073-427c945a6c66?auto=format&fit=crop&w=200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            c.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-400/20 text-amber-400'
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-[10px] text-white/20 uppercase font-black">{c.category}</span>
                       </div>
                       <h4 className="font-bold text-lg group-hover:text-purple-400 transition-colors uppercase italic">{c.title}</h4>
                       <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-white/30">
                             <div className="flex items-center gap-1">
                                <ArrowUpCircle size={14} />
                                <span className="text-xs font-bold">{c.upvotes}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <MessageCircle size={14} />
                                <span className="text-xs font-bold">{c.comments?.length || 0}</span>
                             </div>
                          </div>
                          <span className="text-[10px] font-black text-white/20 uppercase">{new Date(c.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                </div>
              )) : (
                <div className="py-20 text-center glass-panel border-white/5 border-dashed">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group hover:scale-110 transition-transform">
                      <History size={32} className="text-white/20" />
                   </div>
                   <h3 className="text-xl font-bold uppercase italic">No Protocols Found</h3>
                   <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-bold">Your ledger is currently empty.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
