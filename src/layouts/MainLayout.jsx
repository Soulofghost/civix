import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useRegionStore } from '../store/useRegionStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { 
  Home, PlusCircle, MessageSquare, ShieldAlert, 
  LogOut, Menu, X, Bell, Globe, AlertTriangle, ShieldCheck, Languages, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuthStore();
  const { userRegion, availableRegions, setUserRegion } = useRegionStore();
  const { t, currentLanguage, languages, setLanguage } = useLanguageStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: <Home size={20} /> },
    { name: t('register_issue'), path: '/submit', icon: <PlusCircle size={20} /> },
    { name: t('leaderboard'), path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: t('regional_network'), path: '/communication', icon: <MessageSquare size={20} /> },
  ];

  if (['Admin', 'Super Admin', 'Authority', 'Field Worker'].includes(user?.role)) {
    navItems.push({ name: t('control_center'), path: '/admin', icon: <ShieldAlert size={20} /> });
  }


  const notifications = [
    { id: 1, type: 'spike', text: 'Regional Alert: 12 new water issues in Kochi today.', icon: <ShieldCheck className="text-secondary" /> },
    { id: 2, type: 'escalation', text: 'Grievance CIVIX-1001-92 has breached 30-day SLA.', icon: <AlertTriangle className="text-danger" /> },
    { id: 3, type: 'status', text: 'PWD Official updated "Main St Pothole".', icon: <Bell className="text-primary" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surfaceHighlight border-r border-white/5">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-glow" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            Civix
          </h1>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(false)}>
          <X size={24} className="text-textSecondary hover:text-white" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-primary text-white shadow-glow translate-x-1' 
                : 'text-textSecondary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link to="/profile" className="glass-panel p-4 flex items-center justify-between mb-4 bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=${user?.display_name}&background=8A2BE2&color=fff`} className="w-8 h-8 rounded-lg" />
             <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-bold text-white truncate">{user?.display_name}</span>
               <span className="text-[10px] text-textSecondary uppercase font-black truncate">{user?.role}</span>
             </div>
          </div>
          <div className="bg-surface px-2 py-1 rounded text-[10px] font-bold text-accent">
            {user?.points}
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background font-outfit">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full z-30">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-surface/30 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-textSecondary hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-glow" />
              <div className="hidden sm:block">
                  <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
                    <span className="text-white">Civix</span> 
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pr-1">
                      {t('dashboard')}
                    </span>
                  </h2>
                  <p className="text-[10px] text-textSecondary uppercase font-black">{userRegion.city} | {userRegion.state}</p>
                </div>

            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 glass-panel px-3 py-1.5 border-white/5 bg-surfaceHighlight/50">
               <Globe size={14} className="text-primary" />
               <select 
                 className="bg-transparent border-none focus:outline-none text-[10px] font-black text-textSecondary cursor-pointer hover:text-white transition-colors uppercase"
                 value={userRegion.city}
                 onChange={(e) => {
                   const r = availableRegions[0].states[0].districts[0].cities.find(x => x.name === e.target.value);
                   if (r) setUserRegion({ ...userRegion, city: r.name });
                 }}
               >
                 {availableRegions[0].states.map(s => s.districts.map(d => d.cities.map(c => <option key={c.name} value={c.name} className="bg-surface text-white">{c.name}, {d.name}</option>)))}
               </select>
            </div>

            <div className="hidden lg:flex items-center gap-2 glass-panel px-3 py-1.5 border-white/5 bg-surfaceHighlight/50">
               <Languages size={14} className="text-accent" />
               <select 
                 className="bg-transparent border-none focus:outline-none text-[10px] font-black text-textSecondary cursor-pointer hover:text-white transition-colors uppercase"
                 value={currentLanguage}
                 onChange={(e) => setLanguage(e.target.value)}
               >
                 {languages.map(lang => (
                   <option key={lang.code} value={lang.code} className="bg-surface text-white">
                      {lang.flag} {lang.name}
                   </option>
                 ))}
               </select>
            </div>


             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-textSecondary hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl group"
                >
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full shadow-glow"></span>
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-[#1A1C26] border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.8)] z-[10000] rounded-2xl overflow-hidden backdrop-blur-3xl"
                    >
                      <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                         <h3 className="font-bold text-sm text-white">Grievance Alerts</h3>
                         <button className="text-[10px] text-primary uppercase font-black hover:text-white transition-colors" onClick={() => setShowNotifications(false)}>Clear</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                         {notifications.map(n => (
                           <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/10 transition-all flex gap-3 cursor-pointer group">
                              <div className="shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{n.icon}</div>
                              <p className="text-[11px] text-white/60 leading-relaxed group-hover:text-white transition-colors">{n.text}</p>
                           </div>
                         ))}
                      </div>
                      <div className="p-3 text-center bg-black/20">
                         <button className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors" onClick={() => setShowNotifications(false)}>View Unified History</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
            
            <Link to="/profile" className="hover:scale-110 transition-transform">
              <img 
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.display_name}&background=8A2BE2&color=fff`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-lg border border-white/10 ml-2 shadow-sm"
              />
            </Link>

          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 relative custom-scrollbar">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
          
          <div className="relative z-10 max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
