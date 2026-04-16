import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Mail, Lock, LogIn, Globe, UserPlus, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Login() {
  const { login, signUp, loading, error } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Empty fields detected.");
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Identity verified. Accessing Civix.");
      } else {
        if (!displayName) return toast.error("Full name required for registration.");
        await signUp(email, password, displayName);
        toast.success("Profile initialized. Verify your email to activate.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failure.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0B10]">
      {/* Background styling elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 relative z-10 border-white/5 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
             <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition"></div>
             <img 
               src="/logo.jpeg" 
               alt="Civix Logo" 
               className="relative w-20 h-20 rounded-2xl object-cover border border-white/10" 
             />
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
             {isLogin ? 'Welcome back' : 'Join'} Civix
          </h2>
          <p className="text-white/30 mt-2 text-center text-[10px] font-bold uppercase tracking-widest">
             Smart Civic Engagement Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <label className="text-[10px] font-bold uppercase text-white/30 ml-1 tracking-widest">Full Name</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-medium text-sm"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-white/30 ml-1 tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-medium text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-white/30 ml-1 tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-medium text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-purple-600/20 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
               isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
           <button 
             onClick={() => setIsLogin(!isLogin)}
             className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
           >
             {isLogin ? "New to Civix? Create an account" : "Already have an account? Login here"}
           </button>
           
           <div className="flex items-center gap-4 text-white/10">
              <div className="h-[1px] flex-1 bg-current" />
              <Globe size={14} />
              <div className="h-[1px] flex-1 bg-current" />
           </div>

           <p className="text-[9px] text-white/20 uppercase font-bold tracking-tight">
              By accessing this system, you agree to our regional terms and conditions.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
