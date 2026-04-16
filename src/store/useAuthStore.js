import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { IS_DEMO_MODE } from '../utils/api';
import { toast } from 'sonner';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        set({
          user: {
            ...supabaseUser,
            role: profile?.role || 'Citizen',
            display_name: profile?.display_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
            karma: profile?.karma || 0,
            avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || '/anil_avatar.jpg',
          },
          isAuthenticated: true,
          loading: false
        });
      } else if (IS_DEMO_MODE) {
        set({
          user: {
            id: 'auth-citizen-01',
            email: 'citizen@civix.io',
            display_name: 'Anil CC',
            role: 'Citizen',
            karma: 1560,
            points: 120,
            avatar_url: '/anil_avatar.jpg'
          },
          isAuthenticated: true,
          loading: false
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('AUTH INIT ERROR:', err.message);
      if (IS_DEMO_MODE) {
        set({
          user: { id: 'auth-01', display_name: 'Anil CC', role: 'Citizen', karma: 1560, avatar_url: '/anil_avatar.jpg' },
          isAuthenticated: true,
          loading: false
        });
      } else {
        set({ loading: false });
      }
    }

    // Real-time auth observer
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: {
            ...session.user,
            role: profile?.role || 'Citizen',
            display_name: profile?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            karma: profile?.karma || 0,
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '/anil_avatar.jpg',
          },
          isAuthenticated: true,
          loading: false
        });
      } else if (!IS_DEMO_MODE) {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });

    // Demo bypass
    if (IS_DEMO_MODE || email === 'citizen@civix.io') {
      await new Promise(res => setTimeout(res, 600));
      set({
        user: {
          id: 'auth-01',
          email: 'citizen@civix.io',
          display_name: 'Anil CC',
          role: 'Citizen',
          karma: 1560,
          avatar_url: '/anil_avatar.jpg'
        },
        isAuthenticated: true,
        loading: false
      });
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // loading will be set to false by onAuthStateChange
      return { error: null };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName }
        }
      });
      if (error) throw error;

      // Check if email confirmation is required
      const needsConfirmation = !data.session;
      set({ loading: false });
      return { error: null, needsConfirmation };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  loginWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Error:', err.message);
      toast.error('Google sign-in failed: ' + err.message);
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
