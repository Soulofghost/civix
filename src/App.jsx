import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import Communication from './pages/Communication';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import BotWidget from './components/BotWidget';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
  
  return children;
};


function Home() {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (['Admin', 'Super Admin', 'Authority', 'Field Worker'].includes(user?.role)) {
    return <Navigate to="/admin" />;
  }
  
  return <Navigate to="/dashboard" />;
}

function App() {
  const { isAuthenticated, initialize, loading, error: authError } = useAuthStore();

  useEffect(() => {
    console.log("APP: Initializing main application logic...");
    initialize().catch(err => {
      console.error("APP_INIT_ERROR:", err);
    });
  }, [initialize]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0B10]">
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="w-16 h-16 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin relative z-10"></div>
        </div>
        <p className="text-white/40 font-black italic tracking-widest uppercase text-[10px] animate-pulse">
          Synchronizing Neural Interface...
        </p>
        <div className="mt-8 flex gap-2">
           <span className="w-2 h-2 rounded-full bg-white/5 animate-bounce" style={{ animationDelay: '0s' }}></span>
           <span className="w-2 h-2 rounded-full bg-white/5 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
           <span className="w-2 h-2 rounded-full bg-white/5 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {isAuthenticated && <p className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.5em] pointer-events-none">Dashboard Ready ✅</p>}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Home />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['Admin', 'Super Admin', 'Authority', 'Field Worker']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {isAuthenticated && <BotWidget />}
    </ErrorBoundary>
  );
}

export default App;
