import React, { useState, useRef, useEffect } from 'react';
import { useComplaintStore } from '../store/useComplaintStore';
import { useRegionStore } from '../store/useRegionStore';
import { MessageSquare, X, Send, Bot, Mic, Scale, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_FAQ = {
  english: {
    'hello': 'Hello! I am your Regional Civix Bot. How can I help you today?',
    'how to report': 'You can report an issue by navigating to the "Submit Issue" page. I will automatically tag it based on your description!',
    'status': 'Check your Dashboard for live tracking. Issues unresolved after 30 days get legal escalation options.',
    'legal': 'If your complaint is over 30 days old, look for the "Connect Advocate" button on your report card. I can help prepare the documentation!',
    'nearby': 'There are several active road maintenance issues in your city. Check the Regional Map to see them clustered.',
    'default': 'I am your regional assistant. Ask me about reporting, nearby issues, or legal escalation paths for old complaints.'
  },
  malayalam: {
    'hello': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ പ്രാദേശിക സിവിക്സ് ബോട്ട് ആണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
    'legal': '30 ദിവസത്തിൽ കൂടുതൽ പഴക്കമുള്ള പരാതികൾക്കായി നിങ്ങൾക്ക് നിയമസഹായം തേടാം. നിങ്ങളുടെ ഡാഷ്‌ബോർഡ് പരിശോധിക്കുക.',
    'default': 'പരാതികൾ നൽകുന്നതിനെക്കുറിച്ചും നിങ്ങളുടെ പ്രദേശത്തെ പ്രശ്നങ്ങളെക്കുറിച്ചും ചോദിക്കാം.'
  }
};

export default function BotWidget() {
  const { complaints } = useComplaintStore();
  const { userRegion } = useRegionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('english');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { text: `Hi! I'm watching over ${userRegion.city}. Need help with regional issues?`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const msgEndRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (userMsg) => {
    if (!userMsg?.trim()) return;

    setMessages(prev => [...prev, { text: userMsg.trim(), sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      let botResponse = '';
      const lowerMsg = userMsg.toLowerCase();
      
      if (lowerMsg.includes('legal') || lowerMsg.includes('advocate')) {
        botResponse = MOCK_FAQ[lang]['legal'];
      } else if (lowerMsg.includes('nearby') || lowerMsg.includes('region')) {
        const regionalCount = complaints.filter(c => c.region.city === userRegion.city).length;
        botResponse = `There are currently ${regionalCount} reports active in ${userRegion.city}. Would you like to see a summary?`;
      } else {
        const dict = MOCK_FAQ[lang];
        const match = Object.keys(dict).find(k => lowerMsg.includes(k));
        botResponse = dict[match] || dict['default'];
      }

      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 600);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSend("How do I get legal help for my old complaint?");
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] glass-panel shadow-glow flex flex-col overflow-hidden border border-primary/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                   <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">Civix Intelligence</h3>
                  <p className="text-[10px] text-white/70 font-mono tracking-tighter uppercase">{userRegion.city} Node</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setLang(lang === 'english' ? 'malayalam' : 'english')} className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-all uppercase">{lang === 'english' ? 'ML' : 'EN'}</button>
                 <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
                    <X size={16} />
                 </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl flex gap-3 items-start mb-2">
                 <Scale size={18} className="text-primary mt-1 shrink-0" />
                 <p className="text-[10px] text-textSecondary leading-relaxed">System feature: AI now automatically detects if a ticket needs legal escalation after 30 days of inactivity.</p>
              </div>

              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    m.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-surfaceHighlight border border-white/5 text-gray-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>

            {/* Input Overlay for Voice */}
            <AnimatePresence>
               {isListening && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-[60px] top-[60px] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                       <Mic size={32} className="text-primary" />
                    </div>
                    <p className="text-xs font-bold text-white mt-4 uppercase tracking-widest">Listening to Region...</p>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 bg-surface border-t border-white/5 shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                   <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about legal aid or nearby issues..."
                    className="w-full bg-surfaceHighlight border border-white/10 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary text-xs"
                  />
                  <button type="button" onClick={toggleVoice} className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-primary animate-pulse' : 'text-textSecondary hover:text-white'}`}>
                    <Mic size={16} />
                  </button>
                </div>
                <button type="submit" disabled={!input} className="text-white bg-primary p-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-glow disabled:opacity-50 active:scale-95">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-glow flex items-center justify-center transition-all hover:scale-110 relative group"
        >
          <Bot size={28} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
          </span>
        </button>
      )}
    </div>
  );
}
