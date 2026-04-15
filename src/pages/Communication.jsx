import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useRegionStore } from '../store/useRegionStore';
import { 
  Hash, Users, Volume2, Send, Plus, 
  MessageCircle, ShieldCheck, Megaphone, 
  Mic, Search, Bell, Ghost, MoreVertical, Paperclip, Smile, Settings,
  MapPin, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Communication() {
  const { user } = useAuthStore();
  const { rooms, messages, sendMessage } = useChatStore();
  const { userRegion } = useRegionStore();
  
  const [activeChannel, setActiveChannel] = useState(rooms[0]?.id || 'announcements');
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  const roomMessages = messages[activeChannel] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(activeChannel, {
      id: Date.now(),
      sender: user.display_name,
      role: user.role,
      text: message,
      timestamp: new Date().toISOString()
    });
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 font-jakarta">
      {/* Integrated Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
            <Radio className="text-purple-400 animate-pulse" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Community Center</h1>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest flex items-center gap-2">
              <MapPin size={10} className="text-rose-500" /> {userRegion.city} District Frequency
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/100?img=${i+10}`} 
                className="w-10 h-10 rounded-full border-4 border-[#0A0B10] object-cover" 
                alt="member"
              />
            ))}
            <div className="w-10 h-10 rounded-full border-4 border-[#0A0B10] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
              +42
            </div>
          </div>
          <button className="glass-panel px-4 py-2 border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            <Users size={14} /> 128 Active
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-72 hidden lg:flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass-panel p-6 border-white/5 space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Official Channels</h3>
              <div className="space-y-1">
                {[
                  { id: 'announcements', name: 'Announcements', icon: <Megaphone size={16} /> },
                  { id: 'intel-updates', name: 'Field Updates', icon: <ShieldCheck size={16} /> }
                ].map(channel => (
                  <button 
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      activeChannel === channel.id ? 'bg-purple-600 text-white font-bold' : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    {channel.icon}
                    <span>{channel.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Public Topics</h3>
              <div className="space-y-1">
                {rooms.filter(r => r.type === 'thread' || r.id === 'general').map(room => (
                  <button 
                    key={room.id}
                    onClick={() => setActiveChannel(room.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                      activeChannel === room.id ? 'bg-white/10 text-white font-bold border border-white/5' : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Hash size={16} />
                      <span className="truncate">{room.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Voice Channels</h3>
              <div className="space-y-1">
                {['Control Hub', 'Public Hearing'].map(v => (
                  <button key={v} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/30 hover:bg-white/5 transition-all italic">
                    <Volume2 size={16} className="text-emerald-500/40" />
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="glass-panel p-4 border-white/5 bg-gradient-to-br from-white/5 to-transparent">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                   <Settings size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Network Config</p>
                   <p className="text-[9px] text-white/20 uppercase">Encrypted Connection</p>
                </div>
             </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 glass-panel border-white/5 flex flex-col overflow-hidden relative">
          {/* Channel Header */}
          <div className="px-8 h-20 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Hash className="text-purple-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter">{activeChannel.replace('-', ' ')}</h3>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Regional Frequency: {activeChannel}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <button className="p-3 rounded-xl hover:bg-white/5 text-white/30 transition-all"><Search size={18} /></button>
               <button className="p-3 rounded-xl hover:bg-white/5 text-white/30 transition-all"><Bell size={18} /></button>
               <div className="w-px h-6 bg-white/5 mx-2" />
               <button className="p-3 rounded-xl hover:bg-white/5 text-white/30 transition-all"><MoreVertical size={18} /></button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth">
            {roomMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                <Radio size={64} className="mb-4" />
                <h4 className="text-xl font-black uppercase italic">Scanning Frequency...</h4>
                <p className="text-xs uppercase font-bold tracking-widest mt-2">No signals detected in this cluster.</p>
              </div>
            ) : roomMessages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 group"
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${msg.sender}&background=8A2BE2&color=fff`} 
                  className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg object-cover bg-surface" 
                  alt="avatar"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/20 font-black uppercase tracking-widest">{msg.role}</span>
                    <span className="text-[9px] text-white/20 font-bold ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-sm text-white/60 leading-relaxed max-w-4xl p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-8 pt-4 bg-gradient-to-t from-black/40 to-transparent">
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e); }}
                placeholder={`Submit signal to ${activeChannel}...`}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 pr-32 focus:outline-none focus:border-purple-500/50 transition-all font-medium text-sm resize-none shadow-2xl"
                rows={1}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button type="button" className="p-2 text-white/20 hover:text-white transition-colors"><Smile size={20} /></button>
                <button type="button" className="p-2 text-white/20 hover:text-white transition-colors"><Paperclip size={20} /></button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-purple-600 text-white p-3.5 rounded-2xl shadow-lg shadow-purple-600/30"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </form>
            <div className="flex items-center justify-between mt-4 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">
               <div className="flex items-center gap-2">
                  <Mic size={12} className="text-rose-500 animate-pulse" />
                  Voice Encryption Active
               </div>
               <div className="flex items-center gap-4">
                  <span>Authorized Regional Node</span>
                  <span>End-to-End Encrypted</span>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
