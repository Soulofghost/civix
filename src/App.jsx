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
  const { isAuthenticated, initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0A0B10]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (

    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Home />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute roles={['Admin', 'Super Admin', 'Authority', 'Field Worker']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/submit" 
            element={
              <ProtectedRoute>
                <SubmitComplaint />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/communication" 
            element={
              <ProtectedRoute>
                <Communication />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
      
      {isAuthenticated && <BotWidget />}
    </>
  );
}

export default App;
