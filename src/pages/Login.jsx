import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Mail, Lock, LogIn, Globe, UserPlus, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CivixLogo = ({ className }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-purple-600 blur-xl opacity-20 animate-pulse"></div>
    <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-3 shadow-2xl border border-white/20 transform rotate-3">
      <Shield className="text-white w-full h-full" strokeWidth={2.5} />
    </div>
  </div>
);

export default function Login() {
  const { login, signUp, loginWithGoogle, loading, error } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Empty fields detected.");
    
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Identity verified. Accessing Civix.");
          // Force redirect — don't wait for auth state change
          setTimeout(() => { window.location.href = '/dashboard'; }, 500);
        }
      } else {
        if (!displayName) return toast.error("Full name required for registration.");
        const result = await signUp(email, password, displayName);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.needsConfirmation) {
          toast.info("Check your email to confirm your account, then log in.");
          setIsLogin(true);
        } else {
          toast.success("Account created! Welcome to Civix.");
          setTimeout(() => { window.location.href = '/dashboard'; }, 500);
        }
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
          <CivixLogo className="w-16 h-16" />
          <h2 className="text-3xl font-black italic tracking-tighter uppercase itinerant bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent mt-4">
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

           <button
             onClick={() => loginWithGoogle()}
             className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg"
           >
             <svg className="w-4 h-4" viewBox="0 0 48 48">
               <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
               <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
               <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
               <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
             </svg>
             Authorize with Google
           </button>
           
           <p className="text-[9px] text-white/20 uppercase font-bold tracking-tight">
              By accessing this system, you agree to our regional terms and conditions.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
