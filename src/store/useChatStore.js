import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export const useChatStore = create((set, get) => ({
  rooms: [
    { id: 'announcements', name: 'Announcements', type: 'official' },
    { id: 'grievance-help', name: 'Grievance Help', type: 'official' }
  ],
  messages: {},
  isConnected: false,

  initSocket: () => {
    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));

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
  },

  joinRoom: (roomId) => {
    socket.emit('join-room', roomId);
    if (!get().messages[roomId]) {
      set((state) => ({
        messages: { ...state.messages, [roomId]: [] }
      }));
    }
  },

  sendMessage: (roomId, messageData) => {
    const data = { ...messageData, roomId };
    socket.emit('send-message', data);
  },

  createRoomForComplaint: (complaintId, title) => {
    const { rooms } = get();
    const roomId = `thread-${complaintId.slice(-4)}`;
    if (rooms.find(r => r.id === roomId)) return;

    set((state) => ({
      rooms: [...state.rooms, { id: roomId, name: `Thread: ${title}`, type: 'thread', parentId: complaintId }],
      messages: { ...state.messages, [roomId]: [] }
    }));
    
    socket.emit('join-room', roomId);
  }
}));

