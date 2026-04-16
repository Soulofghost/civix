import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  loading: true,

  initialize: async () => {
    // Check active session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({ 
        user: { ...session.user, ...profile }, 
        isAuthenticated: true, 
        loading: false 
      });
    } else {
      set({ loading: false });
    }

    // Listen for changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ 
          user: { ...session.user, ...profile }, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        }
      }
    });

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    set({ loading: false });
    return data;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    
    return data.user;
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });

    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (updates) => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }

    set((state) => ({
      user: { ...state.user, ...updates },
      loading: false
    }));
  },

  addKarma: async (amount) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    const newKarma = (user.karma || 0) + amount;
    
    await supabase
      .from('profiles')
      .update({ karma: newKarma })
      .eq('id', user.id);
      
    set((state) => ({
      user: { ...state.user, karma: newKarma }
    }));
  }
}));


