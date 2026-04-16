import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useComplaintStore } from '../store/useComplaintStore';
import { useRegionStore } from '../store/useRegionStore';
import OverviewMap from '../components/OverviewMap';
import { useLanguageStore } from '../store/useLanguageStore';
import { 
  MapPin, Clock, CheckCircle, AlertTriangle, Filter, Search, Award, 
  Scale, MessageCircle, ArrowUpCircle, TrendingUp, Zap, Newspaper, 
  Activity, ShieldCheck, Download, MoreHorizontal, Bell,
  FileText, Shield, UserCheck, Settings, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/**
 * Issue Progress Tracker Component
 */
const IssueProgress = ({ status }) => {
  const steps = [
    { id: 'Submitted', icon: <FileText size={12} /> },
    { id: 'Verified', icon: <Shield size={12} /> },
    { id: 'Assigned', icon: <UserCheck size={12} /> },
    { id: 'In Progress', icon: <Settings size={12} /> },
    { id: 'Resolved', icon: <CheckCircle size={12} /> }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="py-4 px-1">
      <div className="flex items-center justify-between mb-2">
         <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Case Progress</span>
         <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{currentStepIndex + 1}/{steps.length} Nodes</span>
      </div>
      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          className="absolute h-full bg-gradient-to-r from-purple-500 to-accent" 
        />
      </div>
      <div className="flex justify-between mt-3 px-0.5">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStepIndex;
          const isActive = idx === currentStepIndex;
          return (
            <div key={step.id} className="relative flex flex-col items-center group">
              <div 
                className={`p-1.5 rounded-lg border transition-all duration-300 ${
                  isActive 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                    : isCompleted 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'bg-white/5 border-white/5 text-white/10'
                }`}
              >
                {step.icon}
              </div>
              <div className="absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <span className="bg-black px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-tighter whitespace-nowrap shadow-xl border border-white/10">
                   {step.id}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { complaints, activities, news, stats, notifications, fetchComplaints, initializeRealtime } = useComplaintStore();
  const { userRegion } = useRegionStore();
  const { t } = useLanguageStore();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchComplaints();
    const cleanup = initializeRealtime();
    return () => cleanup && cleanup();
  }, [fetchComplaints, initializeRealtime]);

  const regionalComplaints = useMemo(() => {
    try {
      if (!complaints) return [];
      return complaints; 
    } catch (e) {
      return [];
    }
  }, [complaints]);

  const filteredComplaints = useMemo(() => 
    regionalComplaints.filter(c => {
      const matchesFilter = filter === 'All' || c.status === filter;
      const matchesSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
  [regionalComplaints, filter, searchTerm]);

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
    toast.success('Document protocol generated.');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-jakarta">
      {/* Top Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 glass-panel p-6 border-white/5">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.display_name || 'Citizen'}&background=8B5CF6&color=fff`} 
              alt="Profile" 
              className="relative w-16 h-16 rounded-full border-2 border-white/10"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#0A0B10]"></div>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-white">
              {t('welcome')}, {user?.display_name || 'User'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-white/40 text-sm">
              <MapPin size={14} className="text-purple-500" />
              <span>{userRegion?.city || 'Unknown Node'}, {userRegion?.district || 'Sector'}</span>
              <span className="w-1 h-1 rounded-full bg-white/10"></span>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-emerald-500/80 uppercase text-[10px] font-bold">Secure Session</span>
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
                <div className={`flex items-center gap-2 font-bold ${stat.color}`}>
                  {stat.icon}
                  <span className="text-xl">{stat.value}</span>
                </div>
                <span className="text-[10px] text-white/30 uppercase font-semibold mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
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
            className="glass-panel p-6 border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
                {item.icon}
              </div>
              <MoreHorizontal size={16} className="text-white/20" />
            </div>
            <h3 className="text-2xl font-bold">{item.value}</h3>
            <p className="text-[10px] text-white/30 mt-1 uppercase font-bold">{item.label}</p>
            <p className="text-[10px] text-emerald-400/60 mt-4 font-medium">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 border-white/5">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Search issues..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['All', 'Assigned', 'In Progress', 'Resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    filter === s ? 'bg-purple-600 text-white shadow-md' : 'bg-white/5 text-white/40 hover:bg-white/10'
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
                  <div className="relative h-48 rounded-[1.5rem] overflow-hidden m-1 bg-black/40">
                    <img 
                      src={complaint.attachments?.[0] || 'https://images.unsplash.com/photo-1518135839073-427c945a6c66?q=80&w=800&auto=format&fit=crop'} 
                      alt={complaint.title} 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = '/water_leak.png';
                      }}
                      className="w-full h-full object-cover grayscale-[0.2] transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-bold uppercase">
                      ID: {(complaint.id || '').split('-')[1] || 'TICK'}
                    </div>
                  </div>

                  <div className="p-5 pt-2 space-y-4">
                    <div className="flex items-center gap-2">
                       <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="text-[9px] text-white/30 uppercase font-bold">{complaint.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 uppercase">
                      {complaint.title}
                    </h3>

                    <p className="text-xs text-white/50 line-clamp-2 leading-normal font-normal">
                      {complaint.description}
                    </p>

                    {/* NEW: Issue Progress Tracker */}
                    <IssueProgress status={complaint.status} />

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-white/30">
                          <ArrowUpCircle size={15} />
                          <span className="text-[10px] font-bold">{complaint.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/30">
                          <MessageCircle size={15} />
                          <span className="text-[10px] font-bold">{complaint.comments?.length || 0}</span>
                        </div>
                      </div>
                      <button 
                         onClick={() => handleExport(complaint)}
                         className="p-2 rounded-lg bg-white/5 hover:bg-purple-600/20 text-white/30 hover:text-purple-400 transition-all border border-white/5"
                      >
                         <Download size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center glass-panel border-white/5 border-dashed">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">No Reports Found</h3>
                  <p className="text-[10px] text-white/20 uppercase font-bold mt-2">Adjust your filters to see more regional data.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Intel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-2 border-white/5 h-[320px] overflow-hidden relative rounded-[2rem]">
             <div className="absolute top-4 left-4 z-[100]">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                   <span className="text-[9px] font-bold uppercase">Grid Monitor</span>
                </div>
             </div>
             <OverviewMap />
          </div>

          <section className="glass-panel p-6 border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-purple-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="space-y-6 relative border-l border-white/5 ml-2 pl-4">
              {(activities || []).map((act, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[20.5px] top-1 w-2 h-2 rounded-full bg-[#0A0B10] border border-white/10"></div>
                  <p className="text-[11px] text-white/60 leading-normal font-medium">
                    <span className="font-bold text-white">{act.user}</span> {act.action}
                  </p>
                  <span className="text-[9px] text-white/20 font-bold uppercase mt-1 inline-block">{act.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper size={18} className="text-amber-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider">News Ledger</h3>
            </div>
            <div className="space-y-4">
              {news.map(n => (
                <div key={n.id} className="p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${n.category === 'Alert' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                      {n.category}
                    </span>
                    <span className="text-[8px] text-white/20 font-bold uppercase">{n.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white/80 group-hover:text-white transition-colors uppercase">{n.title}</h4>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
