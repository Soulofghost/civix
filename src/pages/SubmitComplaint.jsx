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
import { safeFetch } from '../utils/api';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { addComplaint, uploadFile } = useComplaintStore();
  const { user, addKarma } = useAuthStore();
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
        toast.success(`Regional file linked.`);
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
        toast.error('Evidence synchronization failed.');
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
      addKarma(25);
      generateAndUploadReport({ ...complaintData, id: ticketId }, user?.id || 'anonymous')
        .then(url => console.log('Report protocol finalized:', url))
        .catch(err => console.error('Report protocol failed:', err));
    }

    setTimeout(() => {
      setIsOptimisticReporting(false);
      toast.success(`Case #${ticketId} registered locally.`);
      navigate('/dashboard');
    }, 1500);
  };

  const [duplicates, setDuplicates] = useState([]);

  useEffect(() => {
    const checkDuplicates = async () => {
      if (form.title.length > 5 && form.category) {
        try {
          const data = await safeFetch('/api/complaints/check-duplicates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: form.title,
              category: form.category,
              location: { city: form.city }
            })
          });
          
          if (data) {
            setDuplicates(data.duplicates || []);
          }
        } catch (err) {
          console.error('Duplicate detection failure');
        }
      }
    };
    const timer = setTimeout(checkDuplicates, 1000);
    return () => clearTimeout(timer);
  }, [form.title, form.category, form.city]);

  const simulateVoiceRecording = () => {
    setIsListening(true);
    toast.info('Starting voice synthesis...');
    setTimeout(() => {
      setIsListening(false);
      const voiceText = "Major leakage in the main water line near Ward 12 junction. Water wastage and low pressure reported.";
      setForm(prev => ({ 
        ...prev, 
        description: voiceText,
        title: "Main Water Line Leakage (Ward 12)",
        category: 'water'
      }));
      toast.success('Voice decoded.');
    }, 3000);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-jakarta">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-purple-500 font-bold uppercase text-[10px] tracking-wider">
             <ShieldCheck size={14} />
             <span>Secure Grievance Protocol</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {t('submit_protocol')}
          </h1>
          <p className="text-white/40 max-w-xl text-sm font-medium">
            Authorized node for {form.city} District. Your data is encrypted and routed via the Regional Governance Grid. 
          </p>
        </div>

        <div className="flex gap-4">
           <div className="glass-panel px-6 py-4 border-emerald-500/10 bg-emerald-500/5 flex items-center gap-4">
              <Zap className="text-emerald-500" size={24} />
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Reputation Impact</p>
                 <p className="text-xl font-bold text-emerald-500">+25 Karma</p>
              </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-panel p-8 space-y-8 bg-white/[0.01] border-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-lg font-bold flex items-center gap-3">
                    <FileText className="text-purple-500" size={20} /> Report an Issue
                 </h3>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">Step 01 / 03</span>
              </div>

                  <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase text-white/30 tracking-wider ml-1">Issue Title</label>
                     <input
                       type="text"
                       placeholder="Summary of the issue..."
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500/50 text-sm font-medium"
                       value={form.title}
                       onChange={(e) => setForm({ ...form, title: e.target.value })}
                     />
                  </div>

                  <AnimatePresence>
                    {duplicates.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center gap-2 text-amber-500 font-bold uppercase text-[10px] tracking-wider">
                           <AlertTriangle size={14} /> Similar Issues Detected
                        </div>
                        <p className="text-[10px] text-white/40 leading-normal uppercase font-medium">
                          Residents have already reported similar issues. Consider upvoting instead of filing a new report.
                        </p>
                        <div className="space-y-2">
                           {duplicates.slice(0, 2).map(dup => (
                             <div key={dup.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                                <span className="text-xs font-bold text-white/70 truncate mr-4">{dup.title}</span>
                                <button type="button" onClick={() => navigate('/dashboard')} className="text-[9px] font-bold uppercase tracking-wider text-amber-500">View</button>
                             </div>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-2 relative">
                     <label className="text-[10px] font-bold uppercase text-white/30 tracking-wider ml-1">Description</label>
                     <textarea
                       placeholder="Provide detailed information here..."
                       rows={6}
                       className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 focus:outline-none focus:border-purple-500/50 text-sm font-normal leading-relaxed resize-none"
                       value={form.description}
                       onChange={(e) => setForm({ ...form, description: e.target.value })}
                     />
                     <div className="absolute bottom-6 right-6 flex items-center gap-4">
                        <button 
                         type="button"
                         onClick={simulateVoiceRecording}
                         className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
                        >
                          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                     </div>
                  </div>
               </div>
           </div>

           <div className="glass-panel p-8 space-y-8 bg-white/[0.01] border-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-lg font-bold flex items-center gap-3">
                    <Camera className="text-emerald-500" size={20} /> Photos & Videos
                 </h3>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">Step 02 / 03</span>
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
                className={`border-2 border-dashed border-white/10 rounded-[2rem] p-8 text-center hover:border-emerald-500/30 transition-all cursor-pointer bg-black/20 min-h-[250px] flex items-center justify-center overflow-hidden relative`}
              >
                 {image ? (
                   <div className="w-full h-full absolute inset-0">
                      {fileType === 'video' ? (
                        <video src={image} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={image} className="w-full h-full object-cover" alt="Preview" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-xs font-bold uppercase tracking-widest">Change Evidence</span>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                         <Camera className="text-white/20" size={24} />
                      </div>
                      <div>
                         <p className="text-base font-bold text-white/80">Upload Proof</p>
                         <p className="text-[10px] text-white/20 uppercase font-bold mt-1 tracking-widest">MAX 25MB (Images/Videos)</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-8 space-y-8 bg-white/[0.02] border-white/10">
             <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-lg font-bold flex items-center gap-3">
                   <MapPin className="text-rose-500" size={20} /> Location Details
                </h3>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase text-white/30 tracking-wider">Select Department</label>
                   <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500/50 text-sm font-medium"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                   >
                     <option value="" className="bg-[#0A0B10]">Target Agency</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-white/30 tracking-wider">Ward/Area</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-rose-500/50 text-sm font-medium"
                        value={form.ward}
                        onChange={(e) => setForm({ ...form, ward: e.target.value })}
                      >
                        <option value="" className="bg-[#0A0B10]">Area</option>
                        <option value="Ward 10">Ward 10</option>
                        <option value="Ward 12">Ward 12</option>
                        <option value="Ward 25">Ward 25</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-white/30 tracking-wider">Pincode</label>
                      <input 
                        type="text" 
                        placeholder="000 000"
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none text-sm font-bold text-center"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold uppercase text-white/30 tracking-wider">Impact Estimate</label>
                   <input
                     type="range"
                     min="1"
                     max="1000"
                     className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-rose-500"
                     value={form.impactLevel}
                     onChange={(e) => setForm({ ...form, impactLevel: e.target.value })}
                   />
                   <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold uppercase text-white/40 tracking-tight">Est. Citizens Affected</span>
                      <span className="text-lg font-bold text-rose-500">{form.impactLevel}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="glass-panel p-6 bg-purple-600/5 border-purple-500/10 space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Anonymous Mode</span>
                <button 
                  type="button"
                  onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.isAnonymous ? 'bg-purple-600' : 'bg-white/10'}`}
                >
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.isAnonymous ? 'right-1' : 'left-1'}`} />
                </button>
             </div>
             <p className="text-[9px] text-white/20 font-medium uppercase leading-normal">
                Personal identity markers will be stripped from the public ledger.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={isOptimisticReporting}
            className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {isOptimisticReporting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> File Report</>}
          </button>
        </div>
      </form>
    </div>
  );
}
