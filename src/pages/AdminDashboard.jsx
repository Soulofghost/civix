import React, { useState, useMemo } from 'react';
import { useComplaintStore } from '../store/useComplaintStore';
import { useAuthStore } from '../store/useAuthStore';
import { useRegionStore } from '../store/useRegionStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  MapPin, UserPlus, FileText, Globe, TrendingUp,
  Activity, Zap, LayoutDashboard, Settings, Users,
  Database, Bell, Search, Filter, Download, ExternalLink,
  History, Server, Cpu, ShieldCheck, ArrowUpRight, Maximize2, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const { complaints, updateStatus, stats: storeStats, activities } = useComplaintStore();
  const { user } = useAuthStore();
  const { userRegion, availableRegions, setUserRegion } = useRegionStore();
  const [filter, setFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredComplaints = useMemo(() => 
    complaints.filter(c => {
      const matchesRegion = user.role === 'Super Admin' || c.region.city === userRegion.city;
      const matchesStatus = filter === 'All' || c.status === filter;
      return matchesRegion && matchesStatus;
    }), [complaints, user.role, userRegion.city, filter]);

  const stats = [
    { label: 'Network Load', value: complaints.length, icon: <Activity />, color: 'text-purple-400', trend: '+12% flux' },
    { label: 'SLA Velocity', value: storeStats.avgResponseTime, icon: <Clock />, color: 'text-blue-400', trend: '-2.4h optimized' },
    { label: 'Trust Index', value: '98.2%', icon: <ShieldCheck />, color: 'text-emerald-400', trend: 'Global S+ Tier' },
    { label: 'Grid Alerts', value: complaints.filter(c => c.escalated).length, icon: <ShieldAlert />, color: 'text-rose-400', trend: 'Neural Breach' },
  ];

  const categoryData = [
    { name: 'Infrastructure', value: 45, color: '#8B5CF6' },
    { name: 'Water Grid', value: 30, color: '#3B82F6' },
    { name: 'Waste Mgmt', value: 15, color: '#10B981' },
    { name: 'Power Matrix', value: 10, color: '#F59E0B' },
  ];

  const handleStatusUpdate = (id, status) => {
    updateStatus(id, status, `Official protocol transition: ${status}`, user.displayName);
    toast.success(`Protocol ${id} transitioned to ${status}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen font-jakarta pb-12 relative overflow-hidden">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="lg:w-72 space-y-4 z-10">
        <div className="glass-panel p-6 border-white/5 bg-black/40 backdrop-blur-2xl">
           <div className="flex items-center gap-4 mb-10 px-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-purple-600/30">
                 <Cpu size={24} />
              </div>
              <div>
                 <h2 className="font-black text-sm tracking-tight">Sovereign Intel</h2>
                 <p className="text-[10px] text-purple-400/60 uppercase tracking-widest font-black leading-none mt-1">Command Core</p>
              </div>
           </div>
           
           <nav className="space-y-1.5">
              {[
                { id: 'overview', label: 'Monitor Grid', icon: <LayoutDashboard size={20} /> },
                { id: 'analytics', label: 'Neural Insights', icon: <TrendingUp size={20} /> },
                { id: 'workforce', label: 'Agency Hub', icon: <Users size={20} /> },
                { id: 'ledger', label: 'Global Ledger', icon: <Database size={20} /> },
                { id: 'settings', label: 'System Config', icon: <Settings size={20} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-black italic transition-all group ${
                    activeTab === item.id ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-white' : 'text-white/20 group-hover:text-white transition-colors'}>
                     {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
           </nav>
        </div>

        <div className="glass-panel p-6 border-white/5 bg-black/40 backdrop-blur-2xl">
           <div className="flex items-center gap-3 mb-6 px-1">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                 <Activity size={16} className="text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Live Grid Status</span>
           </div>
           
           <div className="space-y-5">
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Node Health</span>
                    <span className="text-emerald-400">99.9%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }} animate={{ width: '99.9%' }}
                       className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Throughput</span>
                    <span className="text-purple-400">1.2 GB/s</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }} animate={{ width: '74%' }}
                       className="bg-purple-600 h-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8 z-10">
        {/* Top Intelligence Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass-panel p-6 border-white/5 bg-black/40 backdrop-blur-3xl">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <h1 className="text-3xl font-black tracking-tighter italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">COMMAND HUB</h1>
               <div className="flex items-center gap-2 text-purple-400/60 text-[10px] font-black tracking-widest uppercase mt-1">
                 <Globe size={12} />
                 <span>Regional Grid: {userRegion.city.toUpperCase()} Node 01</span>
               </div>
            </div>
            <div className="hidden lg:block h-12 w-[1px] bg-white/10"></div>
            <div className="hidden lg:flex items-center gap-4">
               {['Kerala', 'Ernakulam', 'Kochi'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/30">
                     {tag}
                  </span>
               ))}
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  placeholder="Query Protocol Ledger..." 
                  className="bg-white/5 border border-white/10 rounded-[1.25rem] py-3 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-purple-500/50 transition-all w-64 lg:w-80 backdrop-blur-md"
                />
             </div>
             <button className="glass-panel p-3 border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-purple-400 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-black"></span>
             </button>
          </div>
        </div>

        {/* Intelligence Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 border-white/5 hover:border-purple-500/30 transition-all relative overflow-hidden group bg-black/20"
            >
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all duration-700"></div>
              <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 ${s.color} shadow-inner`}>
                {React.cloneElement(s.icon, { size: 24 })}
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-1">{s.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black italic tracking-tighter">{s.value}</h3>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 italic bg-emerald-400/5 px-2 py-1 rounded-lg border border-emerald-400/10">
                   <ArrowUpRight size={12} />
                   {s.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Strategic Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 glass-panel p-10 border-white/5 bg-black/40 backdrop-blur-2xl relative">
            <div className="flex items-center justify-between mb-10">
               <div className="space-y-1">
                  <h3 className="text-xl font-black italic">Macro Distribution</h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.25em] font-black">Neural Load Analysis Across Agencies</p>
               </div>
               <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 gap-2">
                  <button className="text-[10px] font-black px-4 py-2 rounded-xl bg-purple-600 text-white shadow-xl uppercase transition-all italic">Realtime Flux</button>
                  <button className="text-[10px] font-black px-4 py-2 rounded-xl text-white/30 uppercase hover:text-white transition-all italic">Historical Sync</button>
               </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complaints.length > 0 ? complaints.map((c, i) => ({ name: i, val: Math.random() * 100 })) : Array(10).fill(0).map((_, i) => ({ name: i, val: 20 + Math.random() * 40 }))}>
                  <defs>
                    <linearGradient id="neuralGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050608', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '20px', fontSize: '10px', fontWeight: '900', color: '#fff', padding: '12px' }}
                    itemStyle={{ color: '#8B5CF6' }}
                    cursor={{ stroke: '#8B5CF6', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#neuralGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 glass-panel p-10 border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-sm font-black italic uppercase tracking-widest leading-none">Agency Saturation</h3>
               <Maximize2 size={16} className="text-white/20 cursor-pointer hover:text-white" />
            </div>
            
            <div className="flex-1 flex items-center justify-center relative">
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-4xl font-black italic tracking-tighter">100%</span>
                  <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mt-1 italic">Active Nodes</span>
               </div>
               <PieChart width={240} height={240}>
                 <Pie
                   data={categoryData}
                   cx="50%" cy="50%"
                   innerRadius={80}
                   outerRadius={100}
                   paddingAngle={8}
                   dataKey="value"
                   animationDuration={1500}
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer" />
                   ))}
                 </Pie>
               </PieChart>
            </div>
            
            <div className="space-y-4 mt-12 bg-white/5 p-6 rounded-[2rem] border border-white/5">
               {categoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }}></div>
                        <span className="text-[10px] text-white/50 font-black uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</span>
                     </div>
                     <span className="text-xs font-black italic">{item.value}%</span>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Global Protocol Ledger - Enterprise Table */}
        <div className="glass-panel border-white/5 overflow-hidden bg-black/40 backdrop-blur-2xl">
          <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/[0.01]">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-600/10 rounded-2xl border border-purple-500/20">
                  <Database size={24} className="text-purple-500" />
               </div>
               <div>
                  <h3 className="font-black italic text-xl tracking-tight uppercase">Protocol Ledger</h3>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Classified State Intelligence Database</p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <button className="flex items-center gap-3 px-6 py-3 rounded-[1.25rem] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic text-white/60">
                  <Download size={14} /> Export Encrypted CSV
               </button>
               <button className="flex items-center gap-3 px-6 py-3 rounded-[1.25rem] bg-purple-600 shadow-2xl shadow-purple-600/30 text-[10px] font-black uppercase tracking-widest italic text-white hover:scale-105 active:scale-95 transition-all">
                  <Zap size={14} /> Global Action Hub
               </button>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
              <thead className="bg-black/60 border-b border-white/5 text-white/20 uppercase tracking-[0.25em] text-[10px] font-black italic">
                <tr>
                  <th className="p-8">Node Identifier</th>
                  <th className="p-8">Subject Specification</th>
                  <th className="p-8">Vulnerability Tier</th>
                  <th className="p-8">Log Timestamp</th>
                  <th className="p-8">Protocol State</th>
                  <th className="p-8 text-right">Access Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-black/10">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-10">
                          <Server size={48} />
                          <p className="font-black italic text-sm tracking-widest uppercase">Data Nodes Offline / Null Results</p>
                       </div>
                    </td>
                  </tr>
                ) : filteredComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-purple-600/[0.03] transition-all group cursor-pointer" onClick={() => setSelectedComplaint(c)}>
                    <td className="p-8">
                       <span className="font-mono text-[10px] font-black text-purple-400 bg-purple-400/5 px-3 py-1.5 rounded-xl border border-purple-400/20 shadow-inner tracking-widest uppercase">
                          {c.id.split('-')[1] || c.id.slice(0, 8)}
                       </span>
                    </td>
                    <td className="p-8">
                       <div className="flex flex-col gap-1">
                          <p className="font-black italic text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{c.title}</p>
                          <div className="flex items-center gap-2 opacity-30 mt-1">
                             <Layers size={10} />
                             <p className="text-[10px] text-white font-black uppercase tracking-widest">{c.department}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-8">
                       <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor] ${c.priority === 'High' ? 'bg-rose-500 text-rose-500 animate-pulse' : 'bg-blue-500 text-blue-500'}`}></div>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">{c.priority || 'Standard'}</span>
                       </div>
                    </td>
                    <td className="p-8">
                       <div className="flex items-center gap-2 text-white/40">
                          <History size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(c.createdAt || c.timestamp).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="p-8">
                       <div className={`w-fit px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border italic ${
                         c.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                         c.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                       }`}>
                         {c.status}
                       </div>
                    </td>
                    <td className="p-8 text-right">
                       <button className="p-3 rounded-2xl bg-white/5 hover:bg-purple-600 text-white/30 hover:text-white transition-all transform hover:scale-110 shadow-lg border border-white/5">
                          <Maximize2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Protocol Intelligence Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-[40px] z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
               animate={{ opacity: 1, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
               className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col border-white/20 overflow-hidden bg-[#050608] shadow-[0_0_100px_rgba(139,92,246,0.15)] rounded-[3rem]"
            >
               <div className="p-10 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-600/10 to-transparent">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-600/40">
                        <ShieldAlert size={32} className="text-white" />
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-black italic tracking-tighter uppercase">PROTOCOL NODE: {selectedComplaint.id.slice(0, 12)}</h2>
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Classified Access</span>
                        </div>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black mt-2 leading-none">Global Grievance Enforcement Ledger</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setSelectedComplaint(null)} 
                     className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group"
                  >
                     <Plus size={24} className="rotate-45 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
               
               <div className="p-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-12 custom-scrollbar">
                  <div className="space-y-10">
                     <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Database size={64} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-6 flex items-center gap-2 italic">
                           <Search size={14} /> Intelligence Context
                        </h3>
                        <p className="text-2xl font-black italic tracking-tight leading-none uppercase">{selectedComplaint.title}</p>
                        <div className="w-16 h-1 bg-purple-600/30 rounded-full my-6"></div>
                        <p className="text-sm text-white/60 leading-relaxed font-medium italic">"{selectedComplaint.description}"</p>
                        
                        <div className="mt-10 flex items-center gap-4">
                           <div className="flex -space-x-3">
                              {[1,2,3].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050608] bg-white/5 flex items-center justify-center text-[10px] font-black italic">
                                    {String.fromCharCode(64 + i)}
                                 </div>
                              ))}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Targeting {selectedComplaint.department} Command</span>
                        </div>
                     </div>
                     
                      <div className="grid grid-cols-2 gap-6">
                        <div className="glass-panel p-6 border-white/5 bg-black/40 group hover:border-emerald-500/30 transition-all">
                           <div className="flex items-center gap-2 mb-3">
                              <Users size={14} className="text-emerald-500/50" />
                              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">Impact Scalar</p>
                           </div>
                           <p className="text-3xl font-black italic text-emerald-500 tracking-tighter">LEVEL {selectedComplaint.impactLevel || 'A-01'}</p>
                        </div>
                        <div className="glass-panel p-6 border-white/5 bg-black/40 group hover:border-blue-500/30 transition-all">
                           <div className="flex items-center gap-2 mb-3">
                              <Globe size={14} className="text-blue-500/50" />
                              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">Neural Sync</p>
                           </div>
                           <p className="text-3xl font-black italic text-blue-400 tracking-tighter">NODE 01</p>
                        </div>
                     </div>

                     {selectedComplaint.attachments?.length > 0 && (
                        <div className="space-y-4">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2 italic">
                              <Camera size={14} /> Visual Protocol Evidence
                           </h3>
                           <div className="grid grid-cols-1 gap-4">
                              {selectedComplaint.attachments.map((url, i) => (
                                 <div key={i} className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 aspect-video relative group">
                                    {url.startsWith('data:video') || url.endsWith('.mp4') ? (
                                       <video src={url} className="w-full h-full object-cover" controls />
                                    ) : (
                                       <img src={url} className="w-full h-full object-cover" alt="Evidence" />
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>


                  <div className="space-y-10">
                     <div className="p-10 rounded-[2.5rem] bg-[#0A0B10] border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 italic flex items-center gap-3">
                           <Zap size={16} className="text-purple-500" /> Operational Transitions
                        </h3>
                        <div className="space-y-4">
                           {['Submitted', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                              <button
                                 key={s}
                                 onClick={() => handleStatusUpdate(selectedComplaint.id, s)}
                                 className={`w-full flex items-center justify-between px-8 py-5 rounded-2xl border transition-all relative group ${
                                    selectedComplaint.status === s 
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_30px_rgba(139,92,246,0.2)]' 
                                    : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white'
                                 }`}
                              >
                                 <span className="text-xs font-black uppercase tracking-[0.2em] italic transition-transform group-hover:translate-x-1">{s} STATE</span>
                                 {selectedComplaint.status === s ? (
                                    <div className="flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                       <ShieldCheck size={18} />
                                    </div>
                                 ) : (
                                    <Clock size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                 )}
                              </button>
                           ))}
                        </div>
                        
                        <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/5">
                           <div className="flex items-center gap-3 mb-4">
                              <Bell size={14} className="text-rose-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic">Action Required</span>
                           </div>
                           <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-tighter italic">
                              Initiating a resolve protocol will automatically sync with the regional news grid and award karma points to the citizen agent.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
