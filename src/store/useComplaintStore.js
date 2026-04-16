import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { IS_DEMO_MODE, safeFetch } from '../utils/api';

const MOCK_COMPLAINTS = [
  { 
    id: 'CIVIX-1024-A', 
    title: 'High-Velocity Water Main Failure', 
    description: 'A major structural failure in the primary water distribution node has resulted in significant high-velocity leakage. The resulting water pressure is causing rapid erosion of the surrounding infrastructure and requires immediate technical intervention for regional stabilization.',
    category: 'Water Supply', 
    status: 'In Progress', 
    upvotes: 156, 
    region: { city: 'Kochi' }, 
    location: { lat: 9.9816, lng: 76.2999, address: 'Civil Line Rd, Kochi' }, 
    priority: 'Critical',
    attachments: ['/water_leak_v2.png'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    timeline: [{ status: 'Submitted', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Verified by Regional Authority' }]
  },
  { 
    id: 'CIVIX-1025-B', 
    title: 'Critical Roadway Structural Instability', 
    description: 'Deep structural road damage detected on the regional transit corridor. Multiple citizen alerts indicate a high probability of vehicular incidents. Emergency repair protocol requested to restore safe transit operations.',
    category: 'Roads & Transport', 
    status: 'Verified', 
    upvotes: 89, 
    region: { city: 'Kochi' }, 
    location: { lat: 9.9700, lng: 76.3100, address: 'MG Road, Kochi' }, 
    priority: 'High',
    attachments: ['/road_pothole_v2.png'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    timeline: [{ status: 'Submitted', timestamp: new Date(Date.now() - 172800000).toISOString(), note: 'Awaiting Department Assignment' }]
  },
  { 
    id: 'CIVIX-1026-C', 
    title: 'Systemic Waste Management Node Overflow', 
    description: 'A critical breach in the regional sanitation protocol has been detected. The local waste management node is exceeding capacity, leading to secondary environmental risks. Sanitation response team synchronization is required.',
    category: 'Waste Management', 
    status: 'Resolved', 
    upvotes: 45, 
    region: { city: 'Kochi' }, 
    location: { lat: 9.9900, lng: 76.2900, address: 'Marine Drive, Kochi' }, 
    priority: 'Medium',
    attachments: ['/garbage_overflow_v2.png'],
    created_at: new Date(Date.now() - 432000000).toISOString(),
    timeline: [{ status: 'Resolved', timestamp: new Date().toISOString(), note: 'Sanitation team deployed and verified.' }]
  }
];

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  activities: [
    { id: 1, user: 'Anil CC', action: 'upvoted report CIVIX-1024-A', time: '2 mins ago' },
    { id: 2, user: 'System Control', action: 'resolved ticket CIVIX-1026-C', time: '1 hr ago' },
  ],
  notifications: [
    { id: 1, title: 'Network Status', message: 'All regional nodes are currently active.', read: false, time: 'Now' },
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

  uploadFile: async (bucket, file, userId) => {
    if (IS_DEMO_MODE) return '/water_leak.png';

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      // Construct public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload fail:', err);
      // Fallback for safety during user testing
      return '/water_leak.png';
    }
  }
}));
