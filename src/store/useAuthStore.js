import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { IS_DEMO_MODE } from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initialize: async () => {
    console.log("AUTH: Initializing security protocol...");
    try {
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        const finalUser = {
          ...supabaseUser,
          role: profile?.role || 'Citizen',
          display_name: profile?.display_name || supabaseUser.email?.split('@')[0],
          karma: profile?.karma || 0
        };

        set({ user: finalUser, isAuthenticated: true, loading: false });
      } else if (IS_DEMO_MODE) {
        // FAIL-SAFE: If no user found and in demo mode, provide a demo session
        console.warn("AUTH: Active session missing. Invoking DEMO_CITIZEN protocol.");
        const demoUser = {
          id: 'demo-citizen-id',
          email: 'demo@civix.io',
          display_name: 'Demo Citizen',
          role: 'Citizen',
          karma: 150,
          avatar_url: 'https://ui-avatars.com/api/?name=Demo+Citizen&background=8B5CF6&color=fff'
        };
        set({ user: demoUser, isAuthenticated: true, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn("AUTH_CRITICAL: Security ledger unreachable. Initializing DEMO_CITIZEN stance.");
        set({ 
          user: { id: 'demo-001', display_name: 'Demo Citizen', role: 'Citizen', karma: 150 }, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ loading: false, error: "System instability detected. Protocol halted." });
      }
    }

    // Observer
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        const finalUser = {
          ...session.user,
          role: profile?.role || 'Citizen',
          display_name: profile?.display_name || session.user.email?.split('@')[0],
          karma: profile?.karma || 0
        };
        set({ user: finalUser, isAuthenticated: true, loading: false });
      } else if (!IS_DEMO_MODE) {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    
    // DEMO LOGIN BYPASS
    if (IS_DEMO_MODE || email === 'demo@civix.io') {
       await new Promise(res => setTimeout(res, 800)); // Simulate lag
       const demoUser = { id: 'demo-001', display_name: 'Demo Citizen', role: 'Citizen', karma: 150 };
       set({ user: demoUser, isAuthenticated: true, loading: false });
       return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  logout: async () => {
    if (!IS_DEMO_MODE) await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  addKarma: (amount) => {
    set(state => ({
      user: state.user ? { ...state.user, karma: (state.user.karma || 0) + amount } : null
    }));
  }
}));
