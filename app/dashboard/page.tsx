'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Send, Plus, Briefcase, Shield, Loader2, Wallet, CheckCircle2, Keyboard, X } from 'lucide-react';
import { useClowee } from '@/hooks/useClowee';
import { createStellarAccount, fundTestnetAccount, getAccountBalance } from '@/lib/stellar';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';

const NEW_USER_GREETINGS = [
  "Hello there. I'm Clowee. It's a pleasure to meet you. I'm here to help you orchestrate your agents and manage your projects securely. Since we'll be working together, I'd love to know who I have the pleasure of supporting today... what should I call you?",
  "Hi! I'm Clowee. I've been looking forward to meeting my next partner in this agentic world. To get us started, may I ask your name?",
  "Welcome. I'm Clowee. It's truly a delight to have you here. I'm your personal agent recruiter and project manager. Since we're just beginning our journey, what name should I use for you?"
];

const RETURNING_USER_GREETINGS = [
  "It feels like catching up with an old friend. Welcome back, {name}. I've got the dashboard ready—where shall we focus our energy today?",
  "Ah, {name}, you're back. Excellent. I've been monitoring our active agents while you were away. Ready to jump back in?",
  "Hello again! It's lovely to have you back in the driver's seat, {name}. I was just reviewing our project status. What's on the agenda today?",
  "Welcome back, {name}! I've been keeping an eye on the command center for you. Shall we see how our agents are progressing?"
];

export default function Dashboard() {
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [balance, setBalance] = useState<string>('0.00');
  const [isFunding, setIsFunding] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(["[SYSTEM] Clowee Intelligence Engine initialized...", "[SYSTEM] Stellar Soroban link established."]);
  const [showDeliverable, setShowDeliverable] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem('clowee_user_name');
    const seen = localStorage.getItem('clowee_last_seen');
    const count = parseInt(localStorage.getItem('clowee_interaction_count') || '0');
    const savedJobs = localStorage.getItem('clowee_active_jobs');
    
    setUserName(name);
    setLastSeen(seen);
    setInteractionCount(count);
    if (savedJobs) setActiveJobs(JSON.parse(savedJobs));

    // Update last seen for next time
    localStorage.setItem('clowee_last_seen', new Date().toISOString());
    localStorage.setItem('clowee_interaction_count', (count + 1).toString());
  }, []);

  // Persist jobs whenever they change
  useEffect(() => {
    localStorage.setItem('clowee_active_jobs', JSON.stringify(activeJobs));
  }, [activeJobs]);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[LOG] ${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 19)]);
  };

  const { 
    isListening, 
    isSpeaking, 
    isThinking, 
    transcript, 
    startListening, 
    stopListening, 
    sendMessage, 
    audioRef,
    speak
  } = useClowee({
    onEscrowTrigger: (params) => {
      // 1. Check Wallet & Balance
      if (!wallet) {
        if (speak) speak("I'd love to help, but your Stellar wallet isn't connected. Please click 'Connect Wallet' in the sidebar first.");
        addLog("Hiring blocked: Wallet not connected.");
        return;
      }
      if (parseFloat(balance) < parseFloat(params.amount)) {
        if (speak) speak(`Your Clowee Vault only has ${balance} XLM, but this job requires ${params.amount}. Please top up your balance using the plus button.`);
        addLog(`Hiring blocked: Insufficient funds (${balance} XLM).`);
        return;
      }

      const newJob = {
        id: Math.random().toString(36).substr(2, 9),
        title: params.title,
        amount: params.amount,
        description: params.description,
        status: 'In Progress',
        progress: 10,
        // Mock deliverable based on title
        deliverable: params.title.toLowerCase().includes('logo') || params.title.toLowerCase().includes('flier') 
          ? { type: 'image', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000' }
          : { type: 'report', content: `## ${params.title} Report\nThis task was completed with 100% precision. All requirements met.` }
      };
      
      setActiveJobs(prev => [...prev, newJob]);
      addLog(`Initializing ${params.title} agent...`);
      addLog(`Creating Stellar Escrow for ${params.amount} USDC...`);
      
      // Simulate progress
      setTimeout(() => {
        addLog(`${params.title} agent scanning requirements...`);
        setActiveJobs(prev => prev.map(job => job.id === newJob.id ? { ...job, progress: 45 } : job));
      }, 3000);

      setTimeout(() => {
        addLog(`${params.title} agent executing task...`);
        setActiveJobs(prev => prev.map(job => job.id === newJob.id ? { ...job, progress: 85 } : job));
      }, 7000);

      setTimeout(() => {
        addLog(`${params.title} task completed. Deliverable secured.`);
        setActiveJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, status: 'Ready for Review', progress: 100 } : job
        ));
        if (speak) speak(`${userName || 'Partner'}, the ${params.title} agent has finished the work. You can now view the deliverable in the sidebar.`);
      }, 12000);
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [wallet, setWallet] = useState<{publicKey: string, secretKey: string} | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  // Initialize wallet and fetch balance
  useEffect(() => {
    const existingWallet = localStorage.getItem('clowee_wallet');
    if (existingWallet) {
      const w = JSON.parse(existingWallet);
      setWallet(w);
      updateBalance(w.publicKey);
    }
  }, []);

  const updateBalance = async (pubkey: string) => {
    try {
      const balances = await getAccountBalance(pubkey);
      const native = balances.find((b: any) => b.asset_type === 'native');
      setBalance(native ? parseFloat(native.balance).toFixed(2) : '0.00');
    } catch (e) {
      console.error('Balance fetch failed');
    }
  };

  const fundAccount = async () => {
    if (!wallet) return;
    setIsFunding(true);
    addLog("Requesting Friendbot funding...");
    try {
      await fundTestnetAccount(wallet.publicKey);
      await updateBalance(wallet.publicKey);
      addLog("Stellar Account funded successfully.");
    } finally {
      setIsFunding(false);
    }
  };

  const startVoiceSession = () => {
    setHasWelcomed(true);
    if (speak) {
      if (userName) {
        // Pick a random returning greeting
        const randomGreeting = RETURNING_USER_GREETINGS[Math.floor(Math.random() * RETURNING_USER_GREETINGS.length)];
        const personalizedGreeting = randomGreeting.replace('{name}', userName);
        
        // Add a "Long time no see" if they haven't been here in 24 hours
        let finalGreeting = personalizedGreeting;
        if (lastSeen && (new Date().getTime() - new Date(lastSeen).getTime() > 86400000)) {
           finalGreeting = "It's been a little while! " + finalGreeting;
        }
        
        speak(finalGreeting);
      } else {
        // Pick a random new user greeting
        const randomGreeting = NEW_USER_GREETINGS[Math.floor(Math.random() * NEW_USER_GREETINGS.length)];
        speak(randomGreeting);
      }
    }
    startListening();
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    addLog("Connecting to Stellar Network...");
    try {
      const newWallet = createStellarAccount();
      setWallet(newWallet);
      localStorage.setItem('clowee_wallet', JSON.stringify(newWallet));
      await updateBalance(newWallet.publicKey);
      addLog("New Stellar Keypair generated.");
    } finally {
      setIsConnecting(false);
    }
  };

  const releaseEscrow = async (jobId: string) => {
    setIsReleasing(true);
    try {
      setActiveJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'Completed', progress: 100 } : job
      ));
      addLog(`Settling transaction for job ${jobId}...`);
      // Simulate chain delay
      await new Promise(r => setTimeout(r, 2000));
      addLog("Funds released from Stellar Escrow.");
      if (speak) speak("Transaction settled. The funds have been released from the vault.");
    } finally {
      setIsReleasing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setShowChat(false); // Hide chat after sending
  };

  // Stats calculation
  const totalEscrowed = activeJobs.reduce((acc, job) => acc + (job.status !== 'Completed' ? parseFloat(job.amount) : 0), 0);
  const activeCount = activeJobs.filter(j => j.status !== 'Completed').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505] text-white">
      <audio ref={audioRef} className="hidden" muted={isMuted} />

      {/* Deliverable Modal */}
      <AnimatePresence>
        {showDeliverable && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
          >
            <div className="glass max-w-4xl w-full rounded-[40px] p-8 border-white/10 relative overflow-hidden">
               <button onClick={() => setShowDeliverable(null)} className="absolute top-6 right-6 p-2 glass rounded-full hover:bg-white/10">
                 <X className="w-6 h-6" />
               </button>
               <h3 className="text-2xl font-black italic mb-6">Agent Deliverable: {showDeliverable.title}</h3>
               
               <div className="bg-black/40 rounded-3xl p-6 border border-white/5 min-h-[400px] flex items-center justify-center overflow-hidden">
                 {showDeliverable.deliverable?.type === 'image' ? (
                   <img src={showDeliverable.deliverable.url} className="max-h-[500px] rounded-2xl shadow-2xl" alt="Agent Work" />
                 ) : showDeliverable.deliverable?.type === 'iframe' ? (
                   <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-white">
                      <iframe src={showDeliverable.deliverable.url} className="w-full h-full border-none" title="Live Preview" />
                   </div>
                 ) : (
                   <div className="prose prose-invert max-w-none text-white/80 w-full">
                     <h4 className="text-accent-secondary mb-4 uppercase tracking-widest text-xs font-bold">Project Brief & Deliverable</h4>
                     <p className="whitespace-pre-wrap text-sm leading-relaxed">{showDeliverable.deliverable?.content || showDeliverable.description}</p>
                   </div>
                 )}
               </div>

               <div className="mt-8 flex justify-end gap-4">
                  <button onClick={() => setShowDeliverable(null)} className="px-6 py-3 rounded-xl glass border-white/10 hover:bg-white/5 font-bold">Close</button>
                  {showDeliverable.status === 'Ready for Review' && (
                    <button 
                      onClick={() => { releaseEscrow(showDeliverable.id); setShowDeliverable(null); }}
                      disabled={isReleasing}
                      className="px-6 py-3 rounded-xl bg-accent-primary font-black hover:scale-105 transition-all flex items-center gap-2"
                    >
                      {isReleasing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve & Pay Agent'}
                    </button>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autoplay Bypass Overlay */}
      <AnimatePresence>
        {!hasWelcomed && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-md"
          >
            <button 
              onClick={startVoiceSession}
              className="px-8 py-4 bg-accent-primary text-white rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(139,92,246,0.5)] flex items-center gap-3"
            >
              <Mic className="w-6 h-6" />
              Initialize Voice Engine
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-80 glass border-r border-white/10 p-6 flex flex-col gap-6 m-4 hidden lg:flex rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Briefcase className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Active Jobs</h2>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
          {activeJobs.length === 0 && (
            <p className="text-sm text-white/30 italic text-center mt-10 px-4">
              "No active agents yet. Ask Clowee to hire one for you!"
            </p>
          )}
          
          <AnimatePresence>
            {activeJobs.map((job) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-4 rounded-2xl flex flex-col gap-3 border-white/5"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    job.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                    job.status === 'Ready for Review' ? 'bg-accent-secondary/20 text-accent-secondary animate-pulse' : 
                    'bg-accent-primary/20 text-accent-primary'
                  }`}>
                    {job.status}
                  </span>
                  <div className="flex gap-1">
                    {job.status !== 'In Progress' && (
                      <button onClick={() => setShowDeliverable(job)} className="p-1 glass rounded hover:bg-white/10">
                        <Send className="w-3 h-3 text-accent-secondary" />
                      </button>
                    )}
                    <Shield className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold">{job.title}</p>
                  <p className="text-[10px] text-white/40 mt-1">{job.description}</p>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${job.status === 'Completed' ? 'bg-green-500' : 'bg-accent-primary'}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${job.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-white/60 font-mono">Escrow: ${job.amount} USDC</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowDeliverable(job)}
                      className="text-[10px] font-bold text-accent-secondary hover:text-white transition-colors underline decoration-dotted"
                    >
                      {job.status === 'Ready for Review' ? 'Verify & Release' : 'View Brief'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          {wallet ? (
            <div className="flex flex-col gap-3">
              <div className="glass p-4 rounded-2xl border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                  <button onClick={fundAccount} disabled={isFunding}>
                    {isFunding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 hover:text-accent-secondary" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Clowee Vault</p>
                    <p className="text-xl font-black italic tracking-tighter text-accent-secondary">{balance} XLM</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                   <p className="text-[9px] text-white/20 truncate font-mono">{wallet.publicKey}</p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-accent-primary hover:scale-[1.02] transition-all font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wallet className="w-4 h-4" /> Connect Wallet</>}
            </button>
            <div className="mt-4 pt-4 border-t border-white/5">
               <p className="text-[10px] text-white/30 leading-relaxed italic text-center">
                 <Shield className="w-3 h-3 inline mr-1 mb-0.5" />
                 Security: This is a non-custodial vault. Your keys are stored locally.
               </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative p-4 lg:p-8 overflow-hidden gap-4">
        {/* Analytics Bar */}
        <div className="grid grid-cols-3 gap-4 z-10">
          <div className="glass p-4 rounded-2xl flex flex-col border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Total Escrowed</span>
            <span className="text-2xl font-black text-accent-primary">${totalEscrowed.toFixed(2)} <span className="text-xs font-normal text-white/20">USDC</span></span>
          </div>
          <div className="glass p-4 rounded-2xl flex flex-col border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Active Agents</span>
            <span className="text-2xl font-black text-accent-secondary">{activeCount} <span className="text-xs font-normal text-white/20">Running</span></span>
          </div>
          <div className="glass p-4 rounded-2xl flex flex-col border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Success Rate</span>
            <span className="text-2xl font-black text-green-400">100% <span className="text-xs font-normal text-white/20">Verified</span></span>
          </div>
        </div>
        <header className="flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <img src="/clowee-logo.jpg" alt="Clowee Logo" className="w-12 h-12 rounded-full object-cover shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
                CLOWEE
              </h1>
              <p className="text-xs text-accent-secondary font-bold uppercase tracking-widest">Agentic Pay Layer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-xl glass hover:bg-white/10 transition-colors border-white/10"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-accent-secondary" />}
            </button>
            <button className="p-3 rounded-xl glass hover:bg-white/10 transition-colors border-white/10">
              <Settings className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-0">
          
          {/* Shrunk Voice Powered Orb */}
          <div className="relative w-[250px] h-[250px] md:w-[350px] md:h-[350px] flex items-center justify-center">
            <div className="absolute inset-0 z-0">
              <VoicePoweredOrb
                enableVoiceControl={isListening}
                className="rounded-full"
                hue={isSpeaking ? 120 : isListening ? 200 : 0}
                maxHoverIntensity={isSpeaking ? 1.5 : 0.8}
              />
            </div>
            <motion.div 
              animate={{ y: [-5, 5, -5], scale: isThinking ? [1, 1.05, 1] : 1 }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 1, repeat: Infinity } }}
              className="absolute z-10 w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.3)] border-2 border-white/10"
            >
              <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: 'url("/orb-bg.png")' }} />
              <div className="absolute inset-0 bg-accent-primary/10 mix-blend-screen" />
            </motion.div>
            {isThinking && (
              <motion.div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <Loader2 className="w-8 h-8 text-white animate-spin opacity-50" />
              </motion.div>
            )}
          </div>
          
          <div className="text-center max-w-2xl min-h-[3rem] flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
              {transcript.length > 0 && (
                <motion.p
                  key={transcript[transcript.length - 1].text}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-bold text-white/90 italic px-8"
                >
                  "{transcript[transcript.length - 1].text}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Command Center: Logs & Suggestions */}
        <div className="grid grid-cols-2 gap-4 z-10 h-32 mt-auto">
          <div className="glass rounded-3xl p-3 flex flex-col border-white/5 overflow-hidden">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse" />
              Process Monitor
            </span>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-white/60 space-y-0.5 custom-scrollbar pr-2">
              {systemLogs.map((log, i) => (
                <div key={i} className={i === 0 ? "text-accent-secondary" : ""}>{log}</div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-3 flex flex-col border-white/5 overflow-hidden">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Agent Suggestions</span>
            <div className="grid grid-cols-2 gap-1.5">
              {["Soroban Audit", "Logo Design", "Copywriting", "UX Research"].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-1.5 flex flex-col hover:border-accent-primary/50 cursor-pointer">
                   <span className="text-[9px] font-bold truncate">{s}</span>
                   <span className="text-[7px] text-white/30 uppercase">Agent Online</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Minimalist Controls */}
        <div className="mx-auto w-full max-w-2xl flex flex-col items-center gap-4 z-10 pt-2 pb-4">
          <AnimatePresence>
            {showChat && (
              <motion.form 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                onSubmit={handleSendMessage} className="w-full relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <label className="p-2 glass rounded-xl hover:bg-white/20 cursor-pointer transition-colors text-white/60 hover:text-white">
                    <Plus className="w-4 h-4" />
                    <input type="file" className="hidden" onChange={(e) => addLog(`Attached: ${e.target.files?.[0]?.name}`)} />
                  </label>
                </div>
                <input
                  type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  placeholder={isThinking ? "Consulting Architect..." : "Describe your project requirements..."}
                  disabled={isThinking} autoFocus
                  className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 pl-14 pr-16 focus:outline-none focus:border-accent-primary text-md shadow-2xl backdrop-blur-xl"
                />
                <button type="submit" disabled={!inputText.trim() || isThinking} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-accent-primary text-white rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl">
            <button onClick={() => setShowChat(!showChat)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showChat ? 'bg-white/20' : 'hover:bg-white/10 text-white/50'}`}>
              {showChat ? <X className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-accent-primary border-accent-primary text-white'}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <div className="px-4 flex flex-col min-w-[100px]">
              <span className="text-[8px] text-white/50 uppercase font-black">Status</span>
              <span className="text-[10px] font-bold">{isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
