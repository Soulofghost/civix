import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const generateTicketId = () => `CIVIX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  activities: [],
  news: [
    { id: 1, title: 'Ward 12 Cleaning Drive', date: '2026-04-18', category: 'Event' },
    { id: 2, title: 'Water Cut Scheduled for Kochi North', date: '2026-04-20', category: 'Alert' },
  ],
  stats: {
    totalResolved: 1240,
    avgResponseTime: '14.2h',
    citizenSatisfaction: 88,
    activeOfficials: 42
  },
  notifications: [
    { id: 1, title: 'Connectivity Established', message: 'You are now synced with the Supabase Grid.', read: false, time: '1s ago' },
  ],
  loading: false,

  uploadFile: async (bucket, file, userId) => {
    const fileExt = file.name ? file.name.split('.').pop() : 'pdf';
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  fetchComplaints: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      set({ complaints: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  initializeRealtime: () => {
    const channel = supabase
      .channel('public:complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, payload => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        set(state => {
          let updatedComplaints = [...state.complaints];
          if (eventType === 'INSERT') {
            updatedComplaints = [newRecord, ...updatedComplaints];
          } else if (eventType === 'UPDATE') {
            updatedComplaints = updatedComplaints.map(c => c.id === newRecord.id ? newRecord : c);
          } else if (eventType === 'DELETE') {
            updatedComplaints = updatedComplaints.filter(c => c.id === oldRecord.id);
          }
          return { complaints: updatedComplaints };
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  addComplaint: async (data) => {
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

    const { error } = await supabase.from('complaints').insert([newComplaint]);

    if (error) {
      console.error('Migration failure:', error);
      return null;
    }

    // Add activity
    await supabase.from('activities').insert([{
      type: 'new_complaint',
      user_name: 'Authorized Citizen',
      action: `initialized protocol: ${data.title}`,
      time_label: 'Just now'
    }]);

    return ticketId;
  },

  addUpvote: async (id) => {
    const current = get().complaints.find(c => c.id === id);
    if (!current) return;

    const { error } = await supabase
      .from('complaints')
      .update({ upvotes: (current.upvotes || 0) + 1 })
      .eq('id', id);

    if (error) console.error('Signal interference:', error);
  },

  verifyComplaint: async (id) => {
    const current = get().complaints.find(c => c.id === id);
    if (!current) return;

    const { error } = await supabase
      .from('complaints')
      .update({ verifications: (current.verifications || 0) + 1 })
      .eq('id', id);

    if (error) console.error('Verification timeout:', error);
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },

  updateStatus: async (id, status, note, official) => {
    const current = get().complaints.find(c => c.id === id);
    if (!current) return;

    const updatedTimeline = [...(current.timeline || []), { status, timestamp: new Date().toISOString(), note, official }];

    await supabase
      .from('complaints')
      .update({ status, timeline: updatedTimeline })
      .eq('id', id);
  }
}));

