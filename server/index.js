const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- AI Chatbot Logic ---
app.post('/api/ai/chat', async (req, res) => {
  const { message, context, language = 'english' } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are "Civix AI", a regional civic assistant for the "Smart Civic Issue Reporting System".
      Current Context: ${JSON.stringify(context)}
      Language: ${language}
      
      User Message: ${message}
      
      Instructions:
      1. Be professional, helpful, and concise.
      2. You can help users submit complaints, check status, or understand legal rights (escalation after 30 days).
      3. If the user mentions an issue, suggest a category (Road, Water, Electricity, Waste).
      4. Detect urgency and sentiment.
      5. Support multilingual responses (English and Malayalam).
      
      Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// --- Duplicate Detection Logic ---
app.post('/api/complaints/check-duplicates', async (req, res) => {
  const { title, description, category, location } = req.body;
  
  try {
    // Basic similarity check using Supabase
    const { data: existing, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('category', category)
      .eq('status', 'Submitted');

    if (error) throw error;

    // Simple distance and text matching (mock for now, could use PostGIS or Vector Search)
    const duplicates = existing.filter(c => {
      const titleMatch = c.title.toLowerCase().includes(title.toLowerCase());
      // For GPS, check distance if available
      return titleMatch;
    });

    res.json({ duplicates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Socket.IO Real-time Tracking & Communication ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    // data: { roomId, sender, text, timestamp, role }
    io.to(data.roomId).emit('receive-message', data);
    
    // Persist to Supabase if needed (optional here as store handles it, but better in backend)
    await supabase.from('messages').insert([{
      room_id: data.roomId,
      sender_name: data.sender,
      text: data.text,
      role: data.role,
      created_at: new Date().toISOString()
    }]);
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Civix Backend active on port ${PORT}`);
});
