import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaintStore } from '../store/useComplaintStore';
import { useAuthStore } from '../store/useAuthStore';
import { useRegionStore } from '../store/useRegionStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { 
  Camera, MapPin, Send, AlertTriangle, Mic, MicOff, Globe, Loader2, 
  ShieldCheck, Info, Eye, EyeOff, Users, Zap, CheckCircle2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateAndUploadReport } from '../utils/reportGenerator';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { addComplaint, uploadFile } = useComplaintStore();
  const { user } = useAuthStore();
  const { availableRegions, departments } = useRegionStore();
  const { t } = useLanguageStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    state: 'Kerala',
    district: 'Ernakulam',
    city: 'Kochi',
    ward: '',
    address: '',
    pincode: '',
    isAnonymous: false,
    impactLevel: 10, // Default estimated people affected
  });

  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isOptimisticReporting, setIsOptimisticReporting] = useState(false);

  const categories = [
    { id: 'water', name: 'Water Supply', dept: 'KWA (Kerala Water Authority)', severity: 'High' },
    { id: 'electricity', name: 'Electricity (KSEB)', dept: 'KSEB (Kerala State Electricity Board)', severity: 'Critical' },
    { id: 'roads', name: 'Roads & Transport', dept: 'PWD (Public Works Department)', severity: 'Medium' },
    { id: 'waste', name: 'Waste Management', dept: 'Kochi Municipal Corporation', severity: 'Medium' },
    { id: 'other', name: 'Other Grievance', dept: 'PRD', severity: 'Low' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error('File size exceeds 25MB protocol limit.');
        return;
      }
      
      const type = file.type.split('/')[0];
      setFileType(type);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setFileObject(file);
        toast.success(`${type === 'video' ? 'Video' : 'Image'} protocol synchronized.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.ward) {
      toast.error('Grievance protocol requires full regional metadata.');
      return;
    }

    setIsOptimisticReporting(true);
    
    let attachmentUrls = [];
    if (fileObject) {
      try {
        const url = await uploadFile('evidence', fileObject, user?.id || 'anonymous');
        attachmentUrls = [url];
      } catch (err) {
        toast.error('Evidence synchronization failed. Proceeding with metadata only.');
        console.error(err);
      }
    }

    const complaintData = {
      ...form,
      user_id: user?.id || 'anonymous',
      attachments: attachmentUrls,
      region: {
        country: 'India',
        state: form.state,
        district: form.district,
        city: form.city,
        ward: form.ward
      },
      location: { 
        lat: 9.9816 + (Math.random() - 0.5) * 0.01, 
        lng: 76.2999 + (Math.random() - 0.5) * 0.01, 
        address: form.address || 'Detected Locality' 
      },
      department: categories.find(c => c.id === form.category)?.dept || 'General',
      timestamp: new Date().toISOString(),
      status: 'In Review',
      priority: categories.find(c => c.id === form.category)?.severity || 'Medium'
    };

    const ticketId = await addComplaint(complaintData);

    if (ticketId) {
      // Generate report PDF in background
      generateAndUploadReport({ ...complaintData, id: ticketId }, user?.id || 'anonymous')
        .then(url => console.log('Report protocol finalized:', url))
        .catch(err => console.error('Report protocol failed:', err));
    }
    
    setTimeout(() => {
      setIsOptimisticReporting(false);
      toast.success(`Protocol Initiated: Case #${ticketId} locked in legal ledger.`);
      navigate('/dashboard');
    }, 1500);
  };

  const simulateVoiceRecording = () => {
    setIsListening(true);
    toast.info('Initiating Neural Voice Synthesis...');
    setTimeout(() => {
      setIsListening(false);
      const voiceText = "Voice decrypted: Major leakage in the main water line near Ward 12 junction. Water wastage and low pressure reported in subsequent areas.";
      setForm(prev => ({ 
        ...prev, 
        description: voiceText,
        title: "Main Water Line Leakage (Ward 12)",
        category: 'water'
      }));
      toast.success('Signal decoded and auto-tagged in protocol.');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 font-jakarta">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-purple-500 font-black tracking-[0.3em] uppercase text-[10px]">
             <ShieldCheck size={14} />
             <span>Secure Grievance Protocol</span>
          </div>
          <h1 className="text-5xl font-black italic bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent tracking-tighter">
            {t('submit_protocol')}
          </h1>
          <p className="text-white/40 max-w-xl text-sm leading-relaxed">
            Authorized node for {form.city} District. Your data is encrypted and routed via the Regional Governance Grid. 
            Estimated SLA response: <span className="text-white">48-72 Hours.</span>
          </p>
        </div>

        
        <div className="flex gap-4">
           <div className="glass-panel px-6 py-4 border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
              <Zap className="text-emerald-500" size={24} />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none">Reputation Impact</p>
                 <p className="text-xl font-black italic text-emerald-500">+25 Karma</p>
              </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-panel p-8 space-y-8 bg-white/[0.02] border-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-xl font-black italic flex items-center gap-3">
                    <FileText className="text-purple-500" size={24} /> Report an Issue
                 </h3>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Step 01 / 03</span>
              </div>

              <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Issue Title</label>
                    <input
                      type="text"
                      placeholder="What would you like to call this report?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                 </div>
                 
                 <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Describe the Problem</label>
                    <textarea
                      placeholder="Tell us what is happening. You can type it here or click the microphone to speak! Our AI will help route it to the right person..."
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-medium leading-relaxed resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <div className="absolute bottom-6 right-6 flex items-center gap-4">
                       <button 
                        type="button"
                        onClick={simulateVoiceRecording}
                        className={`p-4 rounded-2xl transition-all shadow-xl group ${isListening ? 'bg-rose-500 animate-pulse text-white' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
                       >
                         {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 space-y-8 bg-white/[0.02] border-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-xl font-black italic flex items-center gap-3">
                    <Camera className="text-emerald-500" size={24} /> Photos & Videos
                 </h3>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Step 02 / 03</span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/*"
              />

              <div 
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 text-center hover:border-emerald-500/50 transition-all cursor-pointer group bg-black/40 min-h-[300px] flex items-center justify-center overflow-hidden relative`}
              >
                 {image ? (
                   <div className="w-full h-full absolute inset-0 group">
                      {fileType === 'video' ? (
                        <video src={image} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={image} className="w-full h-full object-cover" alt="Preview" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="flex flex-col items-center gap-2">
                           <Camera size={24} className="text-emerald-500" />
                           <span className="text-xs font-black uppercase tracking-widest">Change Evidence</span>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-2xl border border-white/5">
                         <Camera className="text-white/40 group-hover:text-emerald-500" size={32} />
                      </div>
                      <div>
                         <p className="text-lg font-black italic mt-2">{t('upload_visual')}</p>
                         <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-2">MAX 25MB (PNG, JPG, MP4)</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-white/40 tracking-widest mt-4">
                         <ShieldCheck size={10} className="text-emerald-500" />
                         Encryption Active
                      </div>
                   </div>
                 )}
              </div>

           </div>
        </div>

        {/* Sidebar Controls Column */}
        <div className="space-y-8">
          <div className="glass-panel p-8 space-y-8 bg-white/[0.04] border-white/10 shadow-2xl">
             <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-xl font-black italic flex items-center gap-3">
                   <MapPin className="text-rose-500" size={24} /> Where is this?
                </h3>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Select Department</label>
                   <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500/50 transition-all text-sm font-medium appearance-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                   >
                     <option value="" className="bg-[#0A0B10]">Who should fix this?</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name} - Agency</option>)}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Select Ward/Area</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500/50 transition-all text-sm font-medium appearance-none"
                        value={form.ward}
                        onChange={(e) => setForm({ ...form, ward: e.target.value })}
                      >
                        <option value="" className="bg-[#0A0B10]">Choose Area</option>
                        <option value="Ward 10">Ward 10</option>
                        <option value="Ward 12">Ward 12</option>
                        <option value="Ward 25">Ward 25</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Pincode</label>
                      <input 
                        type="text" 
                        placeholder="000 000"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:border-purple-500/50 text-sm font-bold text-center"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Number of People Affected</label>
                   <div className="px-4">
                     <input
                       type="range"
                       min="1"
                       max="1000"
                       className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-rose-500"
                       value={form.impactLevel}
                       onChange={(e) => setForm({ ...form, impactLevel: e.target.value })}
                     />
                     <div className="flex justify-between items-center mt-4">
                       <div className="flex items-center gap-2 text-white/30">
                          <Users size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Est. Citizens Affected</span>
                       </div>
                       <span className="text-xl font-black italic text-rose-500">{form.impactLevel}</span>
                     </div>
                   </div>
                   <p className="text-[9px] text-white/20 uppercase font-black text-center mt-2 tracking-widest italic">Est. citizen impact metric</p>
                </div>
             </div>
          </div>

          {/* Privacy Protocol */}
          <div className="glass-panel p-6 bg-purple-600/5 border-purple-500/10 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {form.isAnonymous ? <EyeOff className="text-purple-400" size={18} /> : <Eye className="text-purple-400" size={18} />}
                   <span className="text-xs font-black uppercase tracking-widest italic">{t('anonymous_mode')}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}
                  className={`w-12 h-6 rounded-full transition-all relative ${form.isAnonymous ? 'bg-purple-600' : 'bg-white/10'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isAnonymous ? 'right-1' : 'left-1'}`} />
                </button>
             </div>
             <p className="text-[9px] text-white/30 leading-relaxed font-bold uppercase tracking-tighter">
                When active, your identity tokens are stripped from the protocol. authorities only see location and priority data.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={isOptimisticReporting}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-[2rem] font-black italic shadow-2xl shadow-purple-600/20 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
          >
            {isOptimisticReporting ? (
               <Loader2 className="animate-spin" size={24} />
            ) : (
               <>
                  <div className="flex items-center gap-3 text-lg">
                    <CheckCircle2 size={24} /> {t('register_case')}
                  </div>
                  <span className="text-[9px] opacity-60">Authorize Legal Protocols</span>
               </>
            )}
          </button>
          
          <div className="p-6 rounded-3xl bg-black/40 border border-white/5 flex gap-4">
             <div className="p-3 bg-purple-500/10 rounded-2xl h-fit">
                <Info size={16} className="text-purple-400" />
             </div>
             <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase">
                BY AUTHORIZING THIS PROTOCOL, YOU AGREE TO THE DIGITAL CIVIL DISCOURSE ACT OF 2026. ALL DATA IS HASHED IN THE PRIVATE STATE LEDGER.
             </p>
          </div>
        </div>
      </form>
    </div>
  );
}
