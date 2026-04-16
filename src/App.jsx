import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading for production optimization
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SubmitComplaint = lazy(() => import('./pages/SubmitComplaint'));
const Communication = lazy(() => import('./pages/Communication'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Advocate = lazy(() => import('./pages/Advocate'));
const BotWidget = lazy(() => import('./components/BotWidget'));

/**
 * Civix Security Protocol: Protected Route Controller
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();
  
  if (loading) return null; // Wait for initialization

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * Global Presentation-Ready Loading Component (Fail-Safe)
 */
const GlobalLoader = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0A0B10] font-jakarta">
    <div className="relative mb-8">
      <div className="absolute -inset-8 bg-purple-500/10 rounded-full blur-[60px] animate-pulse"></div>
      <div className="w-16 h-16 border-2 border-white/5 border-t-purple-500 rounded-full animate-spin relative z-10"></div>
    </div>
    <div className="space-y-3 flex flex-col items-center">
       <p className="text-white font-bold uppercase text-[10px] animate-pulse text-center tracking-widest">
         Initializing Civix System
       </p>
       <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest text-center">
         Establishing Secure Protocol
       </p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize().catch(err => {
      console.error("APP_INIT_FAIL:", err);
    });
  }, [initialize]);

  if (loading) return <GlobalLoader />;

  return (
    <ErrorBoundary>
      {/* Presentation Metadata */}
      {isAuthenticated && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none select-none">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 shadow-2xl">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">System Status: Stable</span>
           </div>
        </div>
      )}

      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          {/* Default Route Logic */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['Admin', 'Super Admin', 'Authority', 'Field Worker']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/submit" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
            <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/advocate" element={<ProtectedRoute><Advocate /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          {/* Fail-Safe Wildcard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      
      {isAuthenticated && <BotWidget />}
    </ErrorBoundary>
  );
}

export default App;
