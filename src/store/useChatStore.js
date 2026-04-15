import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set, get) => ({
      rooms: [
        { id: 'announcements', name: 'Announcements', type: 'official' },
        { id: 'grievance-help', name: 'Grievance Help', type: 'official' },
        { id: 'thread-1001', name: 'Issue Thread: Water Leak MG Rd', type: 'thread', parentId: 'CIVIX-1001-92' }
      ],
      messages: {
        'announcements': [
          { id: 1, sender: 'District Collector', role: 'Super Admin', text: 'Regional emergency alert: Road repair works scheduled for Ward 12 tomorrow from 10 AM to 5 PM.', timestamp: new Date().toISOString() }
        ],
        'thread-1001': [
          { id: 1, sender: 'Adarsh (Citizen)', role: 'Citizen', text: 'Is anyone else facing low pressure after the pipe burst?', timestamp: new Date().toISOString() },
          { id: 2, sender: 'KWA Official', role: 'Authority', text: 'We have dispatched a team for initial assessment. Pressure will be restored shortly.', timestamp: new Date().toISOString() }
        ]
      },

      createRoomForComplaint: (complaintId, title) => {
        const { rooms } = get();
        const roomId = `thread-${complaintId.slice(-4)}`;
        if (rooms.find(r => r.id === roomId)) return;

        set((state) => ({
          rooms: [...state.rooms, { id: roomId, name: `Thread: ${title}`, type: 'thread', parentId: complaintId }],
          messages: { ...state.messages, [roomId]: [] }
        }));
      },

      sendMessage: (roomId, message) => {
        set((state) => {
          const roomMessages = state.messages[roomId] || [];
          return {
            messages: {
              ...state.messages,
              [roomId]: [...roomMessages, message]
            }
          };
        });
        
        // Simple Bot response simulation
        if (message.text.toLowerCase().includes('help')) {
           setTimeout(() => {
             get().sendMessage(roomId, {
               id: Date.now() + 1,
               sender: 'Civix Assistant',
               role: 'Authority',
               text: 'Hello! I am your regional AI assistant. How can I help with this grievance?',
               timestamp: new Date().toISOString()
             });
           }, 1000);
        }
      },

      joinRoom: (roomId) => {
        // Mock join
      }
    }),
    { name: 'civix-communications-v2' }
  )
);
