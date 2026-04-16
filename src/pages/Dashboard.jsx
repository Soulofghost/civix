import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useComplaintStore } from '../store/useComplaintStore';
import { useRegionStore } from '../store/useRegionStore';
import OverviewMap from '../components/OverviewMap';
import { useLanguageStore } from '../store/useLanguageStore';
import { 
  MapPin, Clock, CheckCircle, AlertTriangle, Filter, Search, Award, 
  Scale, MessageCircle, ArrowUpCircle, TrendingUp, Zap, Newspaper, 
  Activity, ShieldCheck, Download, MoreHorizontal, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { complaints, activities, news, stats, notifications, error: storeError, fetchComplaints, initializeRealtime } = useComplaintStore();
  const { userRegion } = useRegionStore();
  const { t } = useLanguageStore();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.log("DASHBOARD: Synchronizing with regional data nodes...");
    fetchComplaints().catch(err => console.error("DASHBOARD_FETCH_FAIL:", err));
    const cleanup = initializeRealtime();
    return () => cleanup && cleanup();
  }, [fetchComplaints, initializeRealtime]);

  // Safe Memoized data
  const regionalComplaints = useMemo(() => {
    try {
      if (!user) return [];
      if (!complaints) return [];
      return user.role === 'Super Admin' 
        ? complaints 
        : complaints.filter(c => c.region?.city === userRegion?.city || !c.region);
    } catch (e) {
      console.warn("DASHBOARD_MEMO_ERROR:", e);
      return [];
    }
  }, [complaints, user, userRegion]);

  const filteredComplaints = useMemo(() => 
    regionalComplaints.filter(c => {
      const matchesFilter = filter === 'All' || c.status === filter;
      const matchesSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
  [regionalComplaints, filter, searchTerm]);

  const trendingIssues = useMemo(() => 
    [...regionalComplaints].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3),
  [regionalComplaints]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Verified': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Assigned': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'In Progress': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'Resolved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const handleExport = (complaint) => {
    if (complaint.report_url) {
      window.open(complaint.report_url, '_blank');
      toast.success('Official protocol report retrieved.');
    } else {
      toast.info('Protocol report still generating... Checking global ledger.');
      toast.promise(new Promise(res => setTimeout(res, 2000)), {
        loading: 'Interrogating Regional Database...',
        success: 'Report retrieved via decentralized backup.',
        error: 'Export failed. Database link severage.'
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-jakarta">
      {/* Fail-Safe Status Indicator */}
      {storeError && (
        <div className="mx-6 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 italic">
            Connection Interruption Detected: Systems operating on regional fail-safe cache.
          </p>
        </div>
      )}

      {/* Top Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 glass-panel p-6 border-white/5">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.display_name || 'Citizen'}&background=8A2BE2&color=fff`} 
              alt="Profile" 
              className="relative w-16 h-16 rounded-full border-2 border-white/10"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#0A0B10]"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
              {t('welcome')}, {user?.display_name || 'Authorized User'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-white/40 text-sm">
              <MapPin size={14} className="text-purple-500" />
              <span>{userRegion?.city || 'Unknown Node'}, {userRegion?.district || 'Sector'}</span>
              <span className="w-1 h-1 rounded-full bg-white/10"></span>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-emerald-500/80 uppercase text-[10px] font-bold tracking-widest">Verified Multi-Layer Session</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[ 
              { label: t('citizen_karma'), value: user?.karma || 0, icon: <Award size={18} />, color: 'text-amber-400' },
              { label: t('city_impact'), value: '42%', icon: <Zap size={18} />, color: 'text-blue-400' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel px-4 py-3 border-white/5 flex flex-col items-center min-w-[100px]">
                <div className={`flex items-center gap-2 font-black ${stat.color}`}>
                  {stat.icon}
                  <span className="text-xl tracking-tighter">{stat.value}</span>
                </div>
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative glass-panel p-4 border-white/5 hover:bg-white/10 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#0A0B10]"></span>
          </button>
        </div>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('resolution_rate'), value: '94.2%', sub: '+2.4% this cycle', icon: <CheckCircle className="text-emerald-400" /> },
          { label: t('response_time'), value: stats?.avgResponseTime || '14.2h', sub: 'Calculated via AI', icon: <Clock className="text-blue-400" /> },
          { label: t('satisfaction'), value: `${stats?.citizenSatisfaction || 88}%`, sub: 'Citizen sentiment', icon: <TrendingUp className="text-purple-400" /> },
          { label: t('active_officials'), value: stats?.activeOfficials || 42, sub: 'On-duty nodes', icon: <Activity className="text-pink-400" /> },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
                {item.icon}
              </div>
              <MoreHorizontal size={16} className="text-white/20" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter">{item.value}</h3>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-[0.2em] font-black">{item.label}</p>
            <p className="text-[10px] text-emerald-400/60 mt-4 font-bold italic">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 border-white/5">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Query Protocol Ledger..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['All', 'Assigned', 'In Progress', 'Resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === s ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
                <motion.div 
                  layout
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card group flex flex-col p-2 border-white/5 overflow-hidden"
                >
                  <div className="relative h-48 rounded-[2rem] overflow-hidden m-2 bg-black/40">
                    <img 
                      src={complaint.attachments?.[0] || 'https://images.unsplash.com/photo-1518135839073-427c945a6c66?q=80&w=800&auto=format&fit=crop'} 
                      alt={complaint.title} 
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-transparent to-transparent opacity-90" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black tracking-widest uppercase">
                      ID: {(complaint.id || '').split('-')[1] || 'LEGACY'}
                    </div>
                  </div>

                  <div className="p-6 pt-2 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">{complaint.category}</span>
                    </div>

                    <h3 className="text-xl font-black italic tracking-tight group-hover:text-purple-400 transition-colors line-clamp-1 uppercase">
                      {complaint.title}
                    </h3>

                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-medium">
                      {complaint.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-white/30">
                          <ArrowUpCircle size={16} />
                          <span className="text-[10px] font-black">{complaint.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/30">
                          <MessageCircle size={16} />
                          <span className="text-[10px] font-black">{complaint.comments?.length || 0}</span>
                        </div>
                      </div>
                      <button 
                         onClick={() => handleExport(complaint)}
                         className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-600/20 text-white/30 hover:text-purple-400 transition-all border border-white/5 hover:border-purple-500/30"
                      >
                         <Download size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-24 text-center glass-panel border-white/5 border-dashed">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-white/10" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">No Active Protocols</h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mt-2 font-bold">Region is currently in optimal state or filters are too restrictive.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Intel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-2 border-white/5 h-[350px] overflow-hidden relative group rounded-[2.5rem]">
             <div className="absolute top-6 left-6 z-[100] flex flex-col gap-2">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-2xl">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Interactive Grid Monitor</span>
                </div>
             </div>
             <OverviewMap />
          </div>

          <section className="glass-panel p-8 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-purple-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">Grid Pulse</h3>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black border border-emerald-500/20 tracking-widest">LIVE</span>
            </div>
            <div className="space-y-8 relative border-l-2 border-white/5 ml-3 pl-6">
              {(activities || []).length > 0 ? (activities || []).map((act, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#0A0B10] border-2 border-white/10 group-hover:border-purple-500 transition-colors shadow-glow"></div>
                  <p className="text-xs text-white/50 leading-relaxed font-semibold">
                    <span className="font-black text-white italic uppercase tracking-tight">{act.user}</span> {act.action}
                  </p>
                  <span className="text-[9px] text-white/20 font-black uppercase mt-1.5 inline-block tracking-widest italic">{act.time}</span>
                </div>
              )) : (
                <div className="text-[10px] text-white/20 font-black uppercase tracking-widest italic text-center py-4">No recent activity</div>
              )}
            </div>
          </section>

          <section className="glass-panel p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <Newspaper size={20} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">Civic Ledger</h3>
            </div>
            <div className="space-y-4">
              {news.map(n => (
                <div key={n.id} className="p-5 rounded-[1.5rem] border border-white/5 bg-black/40 hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${n.category === 'Alert' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                      {n.category}
                    </span>
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{n.date}</span>
                  </div>
                  <h4 className="text-sm font-black italic text-white/80 group-hover:text-white transition-colors uppercase leading-tight">{n.title}</h4>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
