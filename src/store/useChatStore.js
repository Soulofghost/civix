import { create } from 'zustand';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/api';

// Fail-safe socket initialization using the unified API utility
const SOCKET_URL = API_URL || '';

let socket;
try {
  // Only attempt socket connection if we are in a browser environment
  if (typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: 3,
      timeout: 5000,
      autoConnect: false,
      transports: ['websocket', 'polling'] // Ensure compatibility across hosting providers
    });
  } else {
    // SSR Safe Mock
    socket = { on: () => {}, emit: () => {}, off: () => {}, connect: () => {} };
  }
} catch (e) {
  console.error("CHAT_SOCKET_INIT_CRITICAL:", e);
  socket = { on: () => {}, emit: () => {}, off: () => {}, connect: () => {} };
}

export const useChatStore = create((set, get) => ({
  rooms: [
    { id: 'announcements', name: 'Announcements', type: 'official' },
    { id: 'grievance-help', name: 'Grievance Help', type: 'official' }
  ],
  messages: {},
  isConnected: false,

  initSocket: () => {
    console.log(`CHAT: Synchronizing with regional hub at [${SOCKET_URL}]`);
    try {
      if (!socket.connected && typeof socket.connect === 'function') {
        socket.connect();
      }

      socket.on('connect', () => {
        console.log("CHAT: Connectivity established with grid.");
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        console.log("CHAT: Grid connectivity lost. Stance: Offline.");
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
      console.warn("CHAT_INIT_FAIL: Continuing in localized mode.", err);
    }
  },

  joinRoom: (roomId) => {
    try {
       socket.emit('join-room', roomId);
       if (!get().messages[roomId]) {
         set((state) => ({
           messages: { ...state.messages, [roomId]: [] }
         }));
       }
    } catch (e) {
       console.warn("CHAT_ROOM_JOIN_FAIL:", e);
    }
  },

  sendMessage: (roomId, messageData) => {
    try {
       const data = { ...messageData, roomId };
       socket.emit('send-message', data);
    } catch (e) {
       console.error("CHAT_MESSAGE_SEND_FAIL:", e);
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
       console.error("CHAT_ROOM_ALLOCATION_FAIL:", e);
    }
  }
}));
