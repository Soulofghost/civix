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
  const { loginWithGoogle } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      toast.error('Identity protocol failed via Google.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Security violation: Empty fields detected.");
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Identity verified. Accessing Civix Node.");
      } else {
        if (!displayName) return toast.error("Full name required for citizen registration.");
        await signUp(email, password, displayName);
        toast.success("Profile initialized. Verify your email to activate protocol.");
        setIsLogin(true); // Switch to login after signup
      }
    } catch (err) {
      toast.error(err.message || 'Protocol failure during authentication.');
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
               className="relative w-20 h-20 rounded-2xl shadow-glow object-cover border border-white/10" 
             />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
             {isLogin ? 'Initialize' : 'Register'} Civix
          </h2>
          <p className="text-white/30 mt-2 text-center text-[10px] font-black uppercase tracking-[0.3em]">
             Smart Civic Reporting Protocol
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
                <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Full Name</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-medium text-sm"
                    placeholder="Enter legal name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Email Identity</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-medium text-sm"
                placeholder="citizen@protocol.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Password</label>
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black italic py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-purple-600/20 uppercase tracking-widest disabled:opacity-50"
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
             className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
           >
             {isLogin ? "New to Civix? Create an account" : "Already have an account? Login here"}
           </button>
           
           <div className="flex items-center gap-4 text-white/10">
              <div className="h-[1px] flex-1 bg-current" />
              <Globe size={14} />
              <div className="h-[1px] flex-1 bg-current" />
           </div>

           <button
             onClick={handleGoogleLogin}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24">
               <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
               <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
               <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
               <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             Sign in with Google
           </button>
           
           <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">
              Authorized access only. All sessions are logged in the regional ledger.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
