import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  loading: true,

  initialize: async () => {
    console.log("AUTH: Initializing security protocol...");
    try {
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn("AUTH: Active session not found or expired.", userError.message);
        set({ user: null, isAuthenticated: false, loading: false });
      }

      if (supabaseUser) {
        console.log("AUTH: Identity detected. Fetching regional profile...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (profileError) console.error("AUTH: Profile fetch failure. Using fallback defaults.", profileError);

        const finalUser = {
          ...supabaseUser,
          role: profile?.role || 'Citizen',
          display_name: profile?.display_name || supabaseUser.email?.split('@')[0],
          karma: profile?.karma || 0
        };

        console.log("AUTH: Protocol ready. Access granted for:", finalUser.display_name);
        set({ 
          user: finalUser, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error("AUTH_CRITICAL_EXCEPTION:", err);
      set({ loading: false, error: "System instability detected. Protocol halted." });
    }

    // Persistent State Observer
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AUTH_EVENT: ${event}`);
      if (session) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const finalUser = {
            ...session.user,
            role: profile?.role || 'Citizen',
            display_name: profile?.display_name || session.user.email?.split('@')[0],
            karma: profile?.karma || 0
          };

          set({ user: finalUser, isAuthenticated: true, loading: false });
        } catch (e) {
          console.error("AUTH_OBSERVER_ERROR:", e);
        }
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


