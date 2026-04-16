import React from 'react';
import { motion } from 'framer-motion';
import { Scale, PhoneCall, Mail, Building, Users } from 'lucide-react';
import { useLanguageStore } from '../store/useLanguageStore';

export default function Advocate() {
  const { t } = useLanguageStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 text-center rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        
        <Scale className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {t('free_advocate')}
        </h1>
        <p className="text-textSecondary text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Civix has partnered with leading legal professionals to provide pro bono guidance 
          for serious civic grievances. If your issue involves negligence or requires legal escalation, 
          connect with our advocate network for free consultation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">Legal Clinic Online</h3>
            <p className="text-textSecondary text-sm mb-4">Book a virtual 15-minute pro bono session with an expert to understand your rights regarding municipal negligence.</p>
            <button className="btn-primary w-full shadow-lg shadow-primary/20">Book Session</button>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">Document Review</h3>
            <p className="text-textSecondary text-sm mb-4">Submit RTI responses or official documents for a free preliminary legal review by our partner lawyers.</p>
            <button className="btn-secondary w-full bg-white/5 text-white hover:bg-white/10">Submit Documents</button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <PhoneCall className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-textSecondary font-bold mb-1">Helpline</p>
            <p className="text-white font-medium">1800-CIVIX-LAW</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Mail className="text-accent w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-textSecondary font-bold mb-1">Email Support</p>
            <p className="text-white font-medium">legal@civix.in</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Users className="text-green-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-textSecondary font-bold mb-1">Active Advocates</p>
            <p className="text-white font-medium">42 Available Now</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
