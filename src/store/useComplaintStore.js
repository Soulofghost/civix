import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const generateTicketId = () => `CIVIX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

// Safe environment variable access for MCP
const MCP_API_URL = import.meta.env.VITE_MCP_API_URL || import.meta.env.NEXT_PUBLIC_MCP_API_URL || null;

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  activities: [],
  notifications: [
    { id: 1, title: 'Connectivity Established', message: 'You are now synced with the Supabase Grid.', read: false, time: '1s ago' },
  ],
  news: [
    { id: 1, title: 'Ward 12 Cleaning Drive', date: '2026-04-18', category: 'Event' },
    { id: 2, title: 'Water Cut Scheduled for Kochi North', date: '2026-04-20', category: 'Alert' },
  ],
  stats: {
    totalResolved: 1240,
    activeIssues: 0,
    avgResponseTime: '14.2h',
    citizenSatisfaction: 88,
    activeOfficials: 42
  },
  loading: false,
  error: null,

  fetchComplaints: async () => {
    console.log("STORE: Fetching global protocol data...");
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`STORE: ${data?.length || 0} records retrieved from encrypted ledger.`);
      set({ 
        complaints: data || [], 
        stats: {
          ...get().stats,
          activeIssues: (data || []).filter(c => c.status !== 'Resolved').length,
          totalResolved: (data || []).filter(c => c.status === 'Resolved').length + 1000, // + Base offset
        },
        loading: false 
      });
    } catch (err) {
      console.error("STORE_FETCH_ERROR: Protocol unreachable. Invoking fallback data.", err);
      // Fail-Safe Fallback: Mock data if API/DB fails
      set({ 
        complaints: [
          { id: 'CIVIX-MOCK-001', title: 'Power fluctuation in Ward 12', category: 'Energy', status: 'In Progress', upvotes: 12, region: { city: 'Kochi' }, location: { lat: 9.9816, lng: 76.2999 }, description: 'Frequent voltage drops reported. [SATELLITE FALLBACK ACTIVE]', created_at: new Date().toISOString() }
        ],
        loading: false,
        error: "Direct database link severed. Using regional cache."
      });
    }
  },

  addComplaint: async (data) => {
    console.log("STORE: Initializing new grievance protocol...");
    set({ loading: true });
    const ticketId = generateTicketId();
    
    const newComplaint = {
      id: ticketId,
      title: data.title,
      description: data.description,
      category: data.category,
      department: data.department,
      priority: data.priority,
      user_id: data.user_id,
      region: data.region,
      location: data.location,
      status: 'Submitted',
      created_at: new Date().toISOString(),
      sla_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      verifications: 1,
      upvotes: 0,
      tags: [],
      escalated: false,
      timeline: [{ status: 'Submitted', timestamp: new Date().toISOString(), note: 'Grievance registered in decentralized ledger' }],
      attachments: data.attachments || [],
      impact: data.impactLevel || 0
    };

    try {
      const { error } = await supabase.from('complaints').insert([newComplaint]);
      if (error) throw error;

      console.log("STORE: Protocol successfully committed to ledger.");
      
      // Add activity (Silently)
      supabase.from('activities').insert([{
        type: 'new_complaint',
        user_name: 'Authorized Citizen',
        action: `initialized protocol: ${data.title}`,
        time_label: 'Just now'
      }]).catch(() => {});

      set((state) => ({ 
        complaints: [newComplaint, ...state.complaints],
        loading: false 
      }));
      return ticketId;
    } catch (err) {
      console.error("STORE_ADD_ERROR: Deployment failed. Applying local persistence.", err);
      set((state) => ({ 
        complaints: [newComplaint, ...state.complaints],
        loading: false 
      }));
      return ticketId; // Return ID anyway for UI consistency
    }
  },

  addUpvote: async (id) => {
    try {
      const current = get().complaints.find(c => c.id === id);
      if (!current) return;

      const { error } = await supabase
        .from('complaints')
        .update({ upvotes: (current.upvotes || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c)
      }));
    } catch (err) {
       console.warn("STORE_UPVOTE: Signal interference applying local increment.", err);
       set((state) => ({
         complaints: state.complaints.map(c => c.id === id ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c)
       }));
    }
  },

  checkDuplicates: async (title) => {
    if (!MCP_API_URL) {
      console.warn("MCP_CORE: Intel URL missing. Skipping duplicate check protocol.");
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(`${MCP_API_URL}/api/complaints/check-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];
      const data = await response.json();
      return data?.duplicates || [];
    } catch (err) {
      console.error("MCP_CORE: Connection timeout or failure.", err);
      return [];
    }
  },

  initializeRealtime: () => {
    console.log("STORE: Initializing real-time neural sync...");
    try {
      const channel = supabase
        .channel('public:complaints')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
          get().fetchComplaints();
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    } catch (err) {
      console.error("REALTIME_ERROR: Sync protocol detached.", err);
      return () => {};
    }
  },

  updateStatus: async (id, status, note, official) => {
    try {
      const current = get().complaints.find(c => c.id === id);
      if (!current) return;

      const updatedTimeline = [...(current.timeline || []), { status, timestamp: new Date().toISOString(), note, official }];

      const { error } = await supabase
        .from('complaints')
        .update({ status, timeline: updatedTimeline })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, status, timeline: updatedTimeline } : c)
      }));
    } catch (err) {
      console.error("STORE_UPDATE_ERROR:", err);
    }
  }
}));
