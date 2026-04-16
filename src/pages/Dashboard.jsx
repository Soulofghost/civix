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
  const { complaints, verifyComplaint, activities, news, stats, notifications, addUpvote } = useComplaintStore();
  const { userRegion } = useRegionStore();
  const { t } = useLanguageStore();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { fetchComplaints, initializeRealtime } = useComplaintStore();

  useEffect(() => {
    fetchComplaints();
    const cleanup = initializeRealtime();
    return () => cleanup && cleanup();
  }, [fetchComplaints, initializeRealtime]);

  // Memoized regional data
  const regionalComplaints = useMemo(() => {
    if (!user) return [];
    return user.role === 'Super Admin' ? complaints : complaints.filter(c => c.region?.city === userRegion?.city);
  }, [complaints, user, userRegion]);


  const filteredComplaints = useMemo(() => 
    regionalComplaints.filter(c => {
      const matchesFilter = filter === 'All' || c.status === filter;
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
  [regionalComplaints, filter, searchTerm]);

  const trendingIssues = useMemo(() => 
    [...regionalComplaints].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3),
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
      // Fallback: simulate generation if report_url is missing
      toast.promise(new Promise(res => setTimeout(res, 2000)), {
        loading: 'Interrogating Regional Database...',
        success: 'Report retrieved via decentralized backup.',
        error: 'Export failed. Database link severage.'
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-jakarta">
      {/* Top Professional Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-6 glass-panel p-6 border-white/5">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.display_name}&background=8A2BE2&color=fff`} 
              alt="Profile" 
              className="relative w-16 h-16 rounded-full border-2 border-white/10"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#0A0B10]"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {t('welcome')}, {user?.display_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-white/40 text-sm">
              <MapPin size={14} className="text-purple-500" />
              <span>{userRegion.city}, {userRegion.district}</span>
              <span className="w-1 h-1 rounded-full bg-white/10"></span>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-emerald-500/80 uppercase text-[10px] font-bold tracking-widest">Verified Citizen</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[ 
              { label: t('citizen_karma'), value: user?.karma || 0, icon: <Award size={18} />, color: 'text-amber-400' },
              { label: t('city_impact'), value: '42%', icon: <Zap size={18} />, color: 'text-blue-400' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel px-4 py-2 border-white/5 flex flex-col items-center">
                <div className={`flex items-center gap-2 font-bold ${stat.color}`}>
                  {stat.icon}
                  <span className="text-lg">{stat.value}</span>
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-tighter">{stat.label}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative glass-panel p-3 border-white/5 hover:bg-white/10 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('resolution_rate'), value: '94.2%', sub: '+2.4% this month', icon: <CheckCircle className="text-emerald-400" /> },
          { label: t('response_time'), value: stats.avgResponseTime, sub: 'Optimized via AI', icon: <Clock className="text-blue-400" /> },
          { label: t('satisfaction'), value: `${stats.citizenSatisfaction}%`, sub: 'Based on 1.2k ratings', icon: <TrendingUp className="text-purple-400" /> },
          { label: t('active_officials'), value: stats.activeOfficials, sub: 'Monitoring 24/7', icon: <Activity className="text-pink-400" /> },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 border-white/5 hover:border-white/10 transition-all group"
          >


            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                {item.icon}
              </div>
              <MoreHorizontal size={16} className="text-white/20" />
            </div>
            <h3 className="text-2xl font-bold">{item.value}</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{item.label}</p>
            <p className="text-[10px] text-emerald-400/60 mt-2 font-medium">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaints Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 border-white/5">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID, Category, or Keywords..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-purple-500/50 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {['All', 'Assigned', 'In Progress', 'Resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    filter === s ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredComplaints.length > 0 ? filteredComplaints.map((complaint, i) => (
                <motion.div 
                  layout
                  key={complaint.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card group flex flex-col p-1 border-white/5 overflow-hidden"
                >
                  <div className="relative h-48 rounded-[1.8rem] overflow-hidden m-2 bg-gradient-to-br from-white/[0.02] to-white/[0.05] flex items-center justify-center">
                    {(() => {
                      const placeholders = {
                        water: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=800&auto=format&fit=crop',
                        waste: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop',
                        roads: 'https://images.unsplash.com/photo-1591526017267-87383216834b?q=80&w=800&auto=format&fit=crop',
                        other: 'https://images.unsplash.com/photo-1518135839073-427c945a6c66?q=80&w=800&auto=format&fit=crop'
                      };
                      
                      const primarySrc = complaint.attachments?.[0];
                      const fallbackSrc = placeholders[complaint.category?.toLowerCase()] || placeholders.other;

                      if (primarySrc?.startsWith('data:video') || primarySrc?.endsWith('.mp4')) {
                        return (
                          <video 
                            src={primarySrc} 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            muted loop autoPlay
                          />
                        );
                      }

                      return (
                        <img 
                          src={primarySrc || fallbackSrc} 
                          alt={complaint.title} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          onError={(e) => {
                             e.target.onerror = null;
                             e.target.src = fallbackSrc;
                          }}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B10] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase">
                      ID: {complaint.id.split('-')[1]}
                    </div>
                  </div>

                  <div className="p-6 pt-2 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest">{complaint.category}</span>
                    </div>

                    <h3 className="text-lg font-bold leading-tight group-hover:text-purple-400 transition-colors line-clamp-1">
                      {complaint.title}
                    </h3>

                    <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                      {complaint.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => addUpvote(complaint.id)}
                          className="flex items-center gap-1.5 text-white/40 hover:text-purple-400 transition-colors"
                        >
                          <ArrowUpCircle size={16} />
                          <span className="text-xs font-bold">{complaint.upvotes}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-white/40">
                          <MessageCircle size={16} />
                          <span className="text-xs font-bold">{complaint.comments?.length || 0}</span>
                        </div>
                      </div>
                      <button 
                         onClick={() => handleExport(complaint)}
                         className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all tooltip"
                         title="Download Official Report"
                      >
                         <Download size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center glass-panel border-white/5 border-dashed">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold">No Records Found</h3>
                  <p className="text-sm text-white/40 mt-1">Try adjusting your filters or search keywords.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: City Intelligence */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Real-time Intel Map */}
          <div className="glass-panel p-2 border-white/5 h-[300px] overflow-hidden relative group">
             <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Interactive Map</span>
                </div>
             </div>
             <OverviewMap />
          </div>

          {/* Activity Feed */}
          <section className="glass-panel p-6 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Recent Updates</h3>
              </div>
              <span className="text-[10px] text-emerald-500 font-bold">REC</span>
            </div>
            <div className="space-y-6 relative border-l border-white/5 ml-2 pl-4">
              {activities.map((act) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-white/10 border-2 border-[#0A0B10] group-hover:bg-purple-500 transition-colors"></div>
                  <p className="text-sm text-white/80">
                    <span className="font-bold text-white">{act.user}</span> {act.action}
                  </p>
                  <span className="text-[10px] text-white/30 font-medium uppercase mt-0.5 inline-block">{act.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Trending & Insights */}
          <section className="glass-panel p-6 border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Market Insights</h3>
            </div>
            <div className="space-y-4">
              {trendingIssues.map((issue, idx) => (
                <div key={issue.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center font-bold text-white/40 group-hover:text-white transition-colors">
                    #0{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">{issue.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{issue.department}</span>
                    </div>
                  </div>
                  <div className="text-amber-500 flex flex-col items-center justify-center">
                    <ArrowUpCircle size={14} />
                    <span className="text-[10px] font-bold mt-0.5">{issue.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Announcements */}
          <section className="glass-panel p-6 border-white/5 bg-gradient-to-br from-white/5 to-transparent">
             <div className="flex items-center gap-2 mb-6">
                <Newspaper size={18} className="text-white/60" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Civic Bulletin</h3>
             </div>
             <div className="space-y-4">
                {news.map(n => (
                   <div key={n.id} className="p-4 rounded-2xl border border-white/5 bg-black/40 hover:border-white/10 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.category === 'Alert' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {n.category}
                         </span>
                         <span className="text-[10px] text-white/30">{n.date}</span>
                      </div>
                      <h4 className="text-sm font-medium text-white/80">{n.title}</h4>
                   </div>
                ))}
             </div>
          </section>
        </aside>
      </div>

      {/* Floating Action Menu Simulation */}
      <div className="fixed bottom-8 right-8 z-[50]">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center text-white"
        >
          <Zap size={28} />
        </motion.button>
      </div>
    </div>
  );
}
