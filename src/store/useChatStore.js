import { create } from 'zustand';
import { io } from 'socket.io-client';

// Fail-safe socket initialization
const SOCKET_URL = import.meta.env.VITE_MCP_API_URL || import.meta.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:5000';

let socket;
try {
  socket = io(SOCKET_URL, {
    reconnectionAttempts: 3,
    timeout: 5000,
    autoConnect: false // Don't auto-connect to prevent top-level hang
  });
} catch (e) {
  console.error("SOCKET_INIT_CRITICAL:", e);
  socket = { on: () => {}, emit: () => {}, off: () => {} }; // Mock socket
}

export const useChatStore = create((set, get) => ({
  rooms: [
    { id: 'announcements', name: 'Announcements', type: 'official' },
    { id: 'grievance-help', name: 'Grievance Help', type: 'official' }
  ],
  messages: {},
  isConnected: false,

  initSocket: () => {
    console.log("CHAT: Initializing real-time communication protocol...");
    try {
      if (!socket.connected) socket.connect();

      socket.on('connect', () => {
        console.log("CHAT: Connectivity established with regional hub.");
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        console.log("CHAT: Connectivity lost. System in offline stance.");
        set({ isConnected: false });
      });

      socket.on('receive-message', (data) => {
        set((state) => {
          const roomMessages = state.messages[data.roomId] || [];
          return {
            messages: {
              ...state.messages,
              [data.roomId]: [...roomMessages, data]
            }
          };
        });
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('receive-message');
      };
    } catch (err) {
      console.error("CHAT_INIT_FAIL:", err);
    }
  },

  joinRoom: (roomId) => {
    console.log(`CHAT: Entering room [${roomId}]`);
    try {
       socket.emit('join-room', roomId);
       if (!get().messages[roomId]) {
         set((state) => ({
           messages: { ...state.messages, [roomId]: [] }
         }));
       }
    } catch (e) {
       console.warn("CHAT_JOIN_FAIL: Offline mode.", e);
    }
  },

  sendMessage: (roomId, messageData) => {
    try {
       const data = { ...messageData, roomId };
       socket.emit('send-message', data);
    } catch (e) {
       console.error("CHAT_SEND_FAIL:", e);
    }
  },

  createRoomForComplaint: (complaintId, title) => {
    try {
      const { rooms } = get();
      const roomId = `thread-${complaintId.slice(-4)}`;
      if (rooms.find(r => r.id === roomId)) return;

      set((state) => ({
        rooms: [...state.rooms, { id: roomId, name: `Thread: ${title}`, type: 'thread', parentId: complaintId }],
        messages: { ...state.messages, [roomId]: [] }
      }));
      
      socket.emit('join-room', roomId);
    } catch (e) {
       console.error("CHAT_ROOM_CREATE_FAIL:", e);
    }
  }
}));
