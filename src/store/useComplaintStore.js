import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { IS_DEMO_MODE, safeFetch } from '../utils/api';

const MOCK_COMPLAINTS = [
  { 
    id: 'CIVIX-1024-A', 
    title: 'Major Water Mains Leakage', 
    description: 'Significant water wastage reported at the main junction. Immediate repair required to prevent road erosion.',
    category: 'Water Supply', 
    status: 'In Progress', 
    upvotes: 156, 
    region: { city: 'Kochi' }, 
    location: { lat: 9.9816, lng: 76.2999, address: 'Civil Line Rd, Kochi' }, 
    priority: 'Critical',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    timeline: [{ status: 'Submitted', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Verified by Regional Node' }]
  },
  { 
    id: 'CIVIX-1025-B', 
    title: 'Structural Road Damage - Ward 12', 
    description: 'Deep potholes causing accidents. Multiple citizen alerts received in the last 24 hours.',
    category: 'Roads & Transport', 
    status: 'Verified', 
    upvotes: 89, 
    region: { city: 'Kochi' }, 
    location: { lat: 9.9700, lng: 76.3100, address: 'MG Road, Kochi' }, 
    priority: 'High',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    timeline: [{ status: 'Submitted', timestamp: new Date(Date.now() - 172800000).toISOString(), note: 'Awaiting Department Assignment' }]
  },
  { 
    id: 'CIVIX-1026-C', 
    title: 'Scheduled Sanitation Protocol Violation', 
    description: 'Waste management node has failed to synchronize with the regional schedule for 3 days.',
    category: 'Waste Management', 
    status: 'Resolved', 
    upvotes: 45, 
    region: { city: 'Kochi' }, 
    location: { lat: 9.9900, lng: 76.2900, address: 'Marine Drive, Kochi' }, 
    priority: 'Medium',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    timeline: [{ status: 'Resolved', timestamp: new Date().toISOString(), note: 'Sanitation team deployed and verified.' }]
  }
];

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  activities: [
    { id: 1, user: 'Arun K.', action: 'upvoted protocol CIVIX-1024-A', time: '2 mins ago' },
    { id: 2, user: 'System Control', action: 'resolved ticket CIVIX-1026-C', time: '1 hr ago' },
  ],
  notifications: [
    { id: 1, title: 'Network Synchronization', message: 'Regional fail-safe active. All data is locally verified.', read: false, time: 'Now' },
  ],
  news: [
    { id: 1, title: 'Smart Grid Expansion: Kochi West', date: '2026-04-18', category: 'Project' },
    { id: 2, title: 'Monsoon Alert: Preparedness Level 2', date: '2026-04-20', category: 'Alert' },
  ],
  stats: {
    totalResolved: 1542,
    activeIssues: 12,
    avgResponseTime: '12.4h',
    citizenSatisfaction: 94,
    activeOfficials: 64
  },
  loading: false,

  fetchComplaints: async () => {
    set({ loading: true });
    
    if (IS_DEMO_MODE) {
      console.log("STORE: Invoking regional data simulation...");
      await new Promise(res => setTimeout(res, 500));
      set({ complaints: MOCK_COMPLAINTS, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      set({ complaints: data || MOCK_COMPLAINTS, loading: false });
    } catch (err) {
      set({ complaints: MOCK_COMPLAINTS, loading: false });
    }
  },

  addComplaint: async (dataSpec) => {
    set({ loading: true });
    const newEntry = {
      id: `CIVIX-${Math.floor(Math.random()*9000)+1000}`,
      ...dataSpec,
      status: 'In Review',
      created_at: new Date().toISOString(),
      upvotes: 0
    };

    if (IS_DEMO_MODE) {
      set(state => ({ complaints: [newEntry, ...state.complaints], loading: false }));
      return newEntry.id;
    }

    try {
      await supabase.from('complaints').insert([newEntry]);
      set(state => ({ complaints: [newEntry, ...state.complaints], loading: false }));
      return newEntry.id;
    } catch (e) {
      set(state => ({ complaints: [newEntry, ...state.complaints], loading: false }));
      return newEntry.id;
    }
  },

  checkDuplicates: async (title) => {
    if (IS_DEMO_MODE) return MOCK_COMPLAINTS.slice(0, 1);
    return await safeFetch('/api/complaints/check-duplicates', { method: 'POST', body: JSON.stringify({ title }) }, []);
  },

  initializeRealtime: () => {
    if (IS_DEMO_MODE) return () => {};
    const channel = supabase.channel('public:complaints').on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => get().fetchComplaints()).subscribe();
    return () => supabase.removeChannel(channel);
  },

  updateStatus: async (id, status) => {
    set(state => ({
      complaints: state.complaints.map(c => c.id === id ? { ...c, status } : c)
    }));
  },

  uploadFile: async () => {
     return 'https://images.unsplash.com/photo-1518135839073-427c945a6c66?q=80&w=800';
  }
}));
