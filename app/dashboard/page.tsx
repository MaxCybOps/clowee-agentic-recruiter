'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Send, Plus, Briefcase, Shield, Loader2, Wallet, CheckCircle2, Keyboard, X, Menu, LayoutGrid, Store, Factory } from 'lucide-react';
import { useClowee } from '@/hooks/useClowee';
import { useEscrowManager } from '@/hooks/useEscrowManager';
import { createStellarAccount, fundTestnetAccount, getAccountBalance, signAndSubmitTransaction } from '@/lib/stellar';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { CommandPalette } from '@/components/ui/command-palette';
import { Marketplace } from '@/components/ui/marketplace';
import { Workshop } from '@/components/ui/workshop';
import { CloweeLogo } from '@/components/ui/clowee-logo';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBridgeConnected, setIsBridgeConnected] = useState(false);
  const [workerAgents, setWorkerAgents] = useState<{id: string, name: string, task: string, status: string}[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'marketplace' | 'workshop'>('home');
  const [currentSpeech, setCurrentSpeech] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{name: string, content: string}[]>([]);

  useEffect(() => {
    const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
    const name = localStorage.getItem(`clowee_user_name_${activeEmail}`) || localStorage.getItem('clowee_user_name');
    const seen = localStorage.getItem(`clowee_last_seen_${activeEmail}`);
    const count = parseInt(localStorage.getItem(`clowee_interaction_count_${activeEmail}`) || '0');
    const savedJobs = localStorage.getItem(`clowee_active_jobs_${activeEmail}`);
    
    setUserName(name);
    setLastSeen(seen);
    setInteractionCount(count);
    if (savedJobs) {
      setActiveJobs(JSON.parse(savedJobs));
    } else {
      setActiveJobs([]);
    }

    localStorage.setItem(`clowee_last_seen_${activeEmail}`, new Date().toISOString());
    localStorage.setItem(`clowee_interaction_count_${activeEmail}`, (count + 1).toString());
  }, []);

  useEffect(() => {
    const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
    localStorage.setItem(`clowee_active_jobs_${activeEmail}`, JSON.stringify(activeJobs));
  }, [activeJobs]);

  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch('http://localhost:8000/status');
        if (res.ok) setIsBridgeConnected(true);
        else setIsBridgeConnected(false);
      } catch (err) {
        setIsBridgeConnected(false);
      }
    };

    checkBridge();
    const interval = setInterval(checkBridge, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openNotepad = async (content?: string) => {
    if (!isBridgeConnected) return;
    try {
      if (content) {
        await fetch('http://localhost:8000/native/notepad', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
      } else {
        await fetch('http://localhost:8000/native/open-app?app_name=notepad', { method: 'POST' });
      }
    } catch (err) {
      console.error('Failed to open notepad:', err);
    }
  };

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[LOG] ${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBridgeConnected) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8000/native/tasks');
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setWorkerAgents(data.tasks);
            }
          }
        } catch (e) {
          console.error("Task poll failed", e);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isBridgeConnected]);

  useEffect(() => {
    if (!isBridgeConnected) {
      // Fallback: Synchronize activeJobs directly to workerAgents so the Workshop Floor shows active hired agents when the Python desktop backend is offline.
      const mapped = activeJobs.map(job => {
        let name = "Scout";
        const titleLower = job.title.toLowerCase();
        if (titleLower.includes("pixel") || titleLower.includes("design")) name = "Pixel";
        else if (titleLower.includes("syntax") || titleLower.includes("developer") || titleLower.includes("dev")) name = "Syntax";
        else if (titleLower.includes("scribe") || titleLower.includes("copywriter") || titleLower.includes("write")) name = "Scribe";
        
        return {
          id: job.id,
          name: name,
          task: job.description || job.title,
          status: job.status === 'Ready for Review' ? 'Ready' : 
                  job.status === 'Completed' ? 'Completed' : 'Working'
        };
      });
      setWorkerAgents(mapped);
    }
  }, [activeJobs, isBridgeConnected]);

  const delegateTask = async (params: {agent: string, task: string}) => {
    addLog(`Deploying Native Worker (${params.agent}) for: ${params.task}`);
    try {
      await fetch('http://localhost:8000/native/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
    } catch (e) {
      addLog(`Failed to deploy native worker: ${e}`);
    }
  };

  const handleCommandExecute = async (cmd: string, args: string) => {
    addLog(`[COMMAND] Executing: ${cmd} ${args}`);
    if (cmd === 'notepad') {
      await openNotepad(args);
    } else if (cmd === 'delegate') {
      const [agent, ...taskParts] = args.split(' ');
      delegateTask({ agent: agent || 'worker', task: taskParts.join(' ') || 'Assigned task' });
    } else if (cmd === 'research') {
      addLog(`Initiating web reconnaissance on: ${args}...`);
      try {
        const res = await fetch(`http://localhost:8000/native/browser?url=${encodeURIComponent(args)}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          addLog(`Reconnaissance complete: ${data.title}`);
        } else {
          addLog(`Failed to reach site: ${data.error}`);
        }
      } catch (err) {
        addLog(`Bridge error during research: ${err}`);
      }
    } else if (cmd === 'trace') {
      addLog(`[TRACE] Started recording skill trace: ${args}`);
      try {
        await fetch('http://localhost:8000/native/skill/mine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: args, action_sequence: ["Recorded Step 1", "Recorded Step 2"] })
        });
        addLog(`[TRACE] Trace '${args}' saved as an executable skill.`);
      } catch (err) {
        addLog(`Failed to save trace: ${err}`);
      }
    } else {
      addLog(`[COMMAND] Unknown command: ${cmd}`);
    }
  };

  const { createEscrow, isDeploying } = useEscrowManager();

  const { 
    isListening, 
    isSpeaking, 
    isThinking, 
    transcript, 
    startListening, 
    stopListening, 
    sendMessage: cloweeSendMessage, 
    audioRef,
    speak
  } = useClowee({
    openNotepad,
    delegateTask,
    onEscrowTrigger: (params) => {
      if (!wallet) {
        if (speak) speak("I'd love to help, but your Stellar wallet isn't connected. Please click 'Connect Wallet' in the sidebar first.");
        addLog("Hiring blocked: Wallet not connected.");
        return;
      }

      setIsSidebarOpen(true); // Auto-open jobs drawer on mobile so the user sees the card instantly!
      addLog(`Initializing ${params.title} escrow smart contract...`);
      addLog(`Connecting to Trustless Work API...`);

      createEscrow({
        amount: params.amount,
        workerAddress: "",
        title: params.title,
        description: params.description,
        signer: wallet.publicKey
      }).then((result) => {
        const newJob = {
          id: result.escrowId,
          title: params.title,
          amount: params.amount,
          description: params.description,
          status: 'Awaiting Funding',
          progress: 0,
          unsignedTransaction: result.unsignedTransaction,
          deliverable: params.title.toLowerCase().includes('logo') || params.title.toLowerCase().includes('flier') 
            ? { type: 'image', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000' }
            : { type: 'report', content: `## ${params.title} Report\nThis task was completed with 100% precision. All requirements met.` }
        };
        
        setActiveJobs(prev => [...prev, newJob]);
        addLog(`Escrow initialized: ${result.escrowId} (Awaiting funding)`);
        
        if (speak) speak("I have prepared the Stellar Soroban escrow contract. Please click 'Sign & Fund Escrow' in the active jobs panel to secure the budget and authorize the agent.");
      }).catch(err => {
        addLog(`API Error: ${err.message}`);
        if (speak) speak("I encountered an error connecting to the escrow service. Please try again in a moment.");
      });
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [wallet, setWallet] = useState<{publicKey: string, secretKey: string} | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [fundingJobId, setFundingJobId] = useState<string | null>(null);

  const fundActiveJobEscrow = async (jobId: string) => {
    const job = activeJobs.find(j => j.id === jobId);
    if (!job || !wallet) return;

    if (parseFloat(balance) < parseFloat(job.amount)) {
      if (speak) speak(`Your Clowee Vault only has ${balance} XLM, but signing this contract requires ${job.amount} XLM. Please top up your vault using the 'Fund Vault' button first!`);
      addLog(`[ERROR] Signature blocked: Insufficient funds (${balance} XLM).`);
      return;
    }

    try {
      setFundingJobId(jobId);
      addLog(`[SYSTEM] Signing transaction for ${job.title}...`);
      addLog(`[SYSTEM] Submitting to Stellar Testnet (Horizon)...`);

      // Actually sign and submit on the Stellar blockchain!
      await signAndSubmitTransaction(job.unsignedTransaction, wallet.secretKey);

      addLog(`[SYSTEM] On-chain transaction succeeded!`);
      addLog(`[SYSTEM] Smart contract escrow successfully funded.`);

      // Update wallet balance on the dashboard
      await updateBalance(wallet.publicKey);

      // Transition the job to 'In Progress' and begin execution!
      setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'In Progress', progress: 10 } : j));
      
      // Deploy native agent worker
      delegateTask({ agent: job.title, task: job.description });

      // Run progress bar simulation
      setTimeout(() => {
        addLog(`${job.title} agent scanning requirements...`);
        setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: 45 } : j));
      }, 3000);

      setTimeout(() => {
        addLog(`${job.title} agent executing task...`);
        setActiveJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: 85 } : j));
      }, 7000);

      setTimeout(() => {
        addLog(`${job.title} task completed. Deliverable secured.`);
        setActiveJobs(prev => prev.map(j => 
          j.id === jobId ? { ...j, status: 'Ready for Review', progress: 100 } : j
        ));
        if (speak) speak(`${userName || 'Partner'}, the ${job.title} agent has finished the work. You can now view the deliverable in the sidebar.`);
      }, 12000);

    } catch (err: any) {
      console.error(err);
      addLog(`[ERROR] Stellar submit failed: ${err.message}`);
      if (speak) speak(`Transaction failed: ${err.message}`);
    } finally {
      setFundingJobId(null);
    }
  };

  useEffect(() => {
    const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
    const existingWallet = localStorage.getItem(`clowee_wallet_${activeEmail}`);
    if (existingWallet) {
      const w = JSON.parse(existingWallet);
      setWallet(w);
      updateBalance(w.publicKey);
    } else {
      setWallet(null);
      setBalance('0.00');
    }
  }, []);

  const sendMessage = async (text: string) => {
    try {
      addLog(`[SYSTEM] Consulting Architect: Analyzing "${text.substring(0, 20)}..."`);
      await cloweeSendMessage(text);
      addLog("[SYSTEM] Persona established. Communicating response...");
    } catch (err) {
      addLog("[ERROR] Failed to connect to Clowee Intelligence.");
    }
  };

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
        const randomGreeting = RETURNING_USER_GREETINGS[Math.floor(Math.random() * RETURNING_USER_GREETINGS.length)];
        const personalizedGreeting = randomGreeting.replace('{name}', userName);
        let finalGreeting = personalizedGreeting;
        if (lastSeen && (new Date().getTime() - new Date(lastSeen).getTime() > 86400000)) {
           finalGreeting = "It's been a little while! " + finalGreeting;
        }
        speak(finalGreeting);
      } else {
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
      const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
      localStorage.setItem(`clowee_wallet_${activeEmail}`, JSON.stringify(newWallet));
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
      await new Promise(r => setTimeout(r, 2000));
      addLog("Funds released from Stellar Escrow.");
      if (speak) speak("Transaction settled. The funds have been released from the vault.");
    } finally {
      setIsReleasing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd read the file content, for the demo we just grab the name to pass as context
      setAttachedFiles(prev => [...prev, { name: file.name, content: `Content of ${file.name}` }]);
      addLog(`Attached file: ${file.name}`);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;
    
    // Pass both text and attached files
    cloweeSendMessage(inputText, attachedFiles);
    setInputText('');
    setAttachedFiles([]);
    setShowChat(false);
  };

  const totalEscrowed = activeJobs.reduce((acc, job) => acc + (job.status !== 'Completed' ? parseFloat(job.amount) : 0), 0);
  const activeCount = activeJobs.filter(j => j.status !== 'Completed').length;

  return (
    <>
      <audio ref={audioRef} className="hidden" muted={isMuted} />
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onExecute={handleCommandExecute} 
      />

      <AnimatePresence>
        {!hasWelcomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full glass rounded-[40px] p-8 border-white/10 text-center flex flex-col items-center gap-6 relative overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/10 to-transparent pointer-events-none" />
              
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-primary/20 relative shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/orb-bg.png")' }} />
                <div className="absolute inset-0 bg-accent-primary/10 mix-blend-screen" />
              </div>

              <div>
                <h1 className="text-3xl font-black italic tracking-tighter mb-2 text-white">CLOWEE</h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Your voice-first multi-agent recruiter and project manager is ready. Click below to establish the neural connection and initialize the audio session.
                </p>
              </div>

              <button
                onClick={startVoiceSession}
                className="w-full py-4 rounded-2xl bg-accent-primary hover:bg-accent-secondary text-white font-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Mic className="w-5 h-5 animate-pulse" />
                Initialize Voice Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeliverable && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-8"
          >
            <div className="glass max-w-4xl w-full rounded-[40px] p-6 sm:p-8 border-white/10 relative overflow-hidden">
               <button onClick={() => setShowDeliverable(null)} className="absolute top-6 right-6 p-2 glass rounded-full hover:bg-white/10 text-white/70">
                 <X className="w-5 h-5" />
               </button>
               <h3 className="text-xl sm:text-2xl font-black italic mb-6">Agent Deliverable: {showDeliverable.title}</h3>
               
               <div className="bg-black/40 rounded-3xl p-4 sm:p-6 border border-white/5 min-h-[300px] sm:min-h-[400px] flex items-center justify-center overflow-y-auto max-h-[60vh] custom-scrollbar">
                 {showDeliverable.deliverable?.type === 'image' ? (
                   <img src={showDeliverable.deliverable.url} className="max-h-[50vh] rounded-2xl shadow-2xl object-contain" alt="Agent Work" />
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
                      className="px-6 py-3 rounded-xl bg-accent-primary font-black hover:scale-105 transition-all flex items-center gap-2 text-black"
                    >
                      {isReleasing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve & Pay Agent'}
                    </button>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="h-screen w-full bg-black flex flex-col lg:flex-row text-white overflow-hidden font-sans selection:bg-accent-primary/30">
        
        {/* Responsive Mobile Header */}
        <header className="lg:hidden w-full flex items-center justify-between p-4 border-b border-white/5 bg-black/60 backdrop-blur-md z-40">
          <div className="flex items-center gap-2">
            <CloweeLogo size={28} animate={true} glow={true} />
            <span className="font-black text-lg tracking-tight">Clowee.</span>
          </div>
          
          <div className="flex items-center gap-3">
            {wallet && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-xs font-bold">
                <span className="text-white/80">{balance}</span>
                <span className="text-accent-secondary text-[9px]">XLM</span>
              </div>
            )}
            
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl glass hover:bg-white/10 text-white relative"
            >
              <Briefcase className="w-5 h-5 text-accent-primary" />
              {activeCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black animate-pulse">
                  {activeCount}
                </div>
              )}
            </button>
          </div>
        </header>

        <aside className={`
          fixed inset-y-0 left-0 z-50 w-80 glass border-r border-white/10 p-6 flex flex-col gap-6 m-0 rounded-none h-full transition-transform duration-300 lg:static lg:translate-x-0 lg:m-4 lg:rounded-3xl lg:h-[calc(100vh-2rem)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          
          {/* Close button on mobile sidebar */}
          <div className="flex lg:hidden justify-end">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Brand header */}
          <div className="hidden lg:flex items-center gap-2 mb-2">
            <CloweeLogo size={36} animate={true} glow={true} />
            <span className="font-black text-xl tracking-tight">Clowee.</span>
          </div>
        {/* Wallet Vault Card */}
        <div className="glass p-4 rounded-2xl border-white/5 relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/20 blur-2xl rounded-full -mr-10 -mt-10" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Clowee Vault</span>
            <Wallet className="w-4 h-4 text-accent-primary" />
          </div>
          
          {wallet ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-1 text-2xl font-black text-white">
                {balance} <span className="text-sm text-accent-secondary mb-1">XLM</span>
              </div>
              <span className="text-[9px] font-mono text-white/40">{wallet.publicKey.substring(0, 8)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}</span>
              <button 
                onClick={fundAccount} disabled={isFunding}
                className="mt-2 text-xs font-bold bg-white/10 hover:bg-white/20 transition-all rounded-lg py-2 disabled:opacity-50"
              >
                {isFunding ? 'Funding Vault...' : 'Fund Vault (Testnet)'}
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet} disabled={isConnecting}
              className="mt-2 text-sm font-bold bg-accent-primary hover:bg-accent-secondary text-black transition-all rounded-xl py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect Wallet'}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <button onClick={() => setActiveView('home')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'home' ? 'bg-accent-primary text-white font-bold' : 'hover:bg-white/5 text-white/60'}`}>
            <LayoutGrid className="w-5 h-5" />
            Control Center
          </button>
          <button onClick={() => setActiveView('marketplace')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'marketplace' ? 'bg-accent-primary text-white font-bold' : 'hover:bg-white/5 text-white/60'}`}>
            <Store className="w-5 h-5" />
            Marketplace
          </button>
          <button onClick={() => setActiveView('workshop')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'workshop' ? 'bg-accent-primary text-white font-bold' : 'hover:bg-white/5 text-white/60'}`}>
            <Factory className="w-5 h-5" />
            Workshop
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Briefcase className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Active Jobs</h2>
        </div>

        <div className="glass p-4 rounded-2xl border-white/5 bg-accent-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">Process Monitor</h3>
          </div>
          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
            {systemLogs.slice(-4).map((log, i) => (
              <div key={i} className="flex gap-2 items-start opacity-60">
                 <div className="w-1 h-3 bg-accent-primary/40 rounded-full mt-0.5" />
                 <p className="text-[9px] font-mono leading-tight">{log}</p>
              </div>
            ))}
          </div>
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
                    job.status === 'Awaiting Funding' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-accent-primary/20 text-accent-primary'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold">{job.title}</p>
                </div>

                {job.status === 'Awaiting Funding' ? (
                  <button
                    onClick={() => fundActiveJobEscrow(job.id)}
                    disabled={fundingJobId === job.id}
                    className="w-full text-[10px] sm:text-xs font-black bg-amber-500 hover:bg-amber-600 text-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] mt-1"
                  >
                    {fundingJobId === job.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Signing & Funding...
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        Sign & Fund Escrow ({job.amount} XLM)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${job.status === 'Completed' ? 'bg-green-500' : 'bg-accent-primary'}`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative p-4 lg:p-8 overflow-hidden gap-4">
        
        {/* View Routing */}
        {activeView === 'marketplace' ? (
          <Marketplace />
        ) : activeView === 'workshop' ? (
          <Workshop workers={workerAgents} onViewDeliverable={(worker) => {
             setShowDeliverable({
               id: worker.id,
               title: worker.task,
               description: "Completed by agent",
               status: 'Ready for Review',
               deliverable: { type: 'report', content: `## ${worker.task} Report\nCompleted by ${worker.name}.` }
             } as any);
          }} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 lg:gap-4 z-10 w-full lg:max-w-4xl mx-auto">
              <div className="glass p-3 lg:p-4 rounded-2xl flex flex-col border-white/5 items-center lg:items-start text-center lg:text-left">
                <span className="text-[8px] lg:text-[10px] text-white/40 font-black uppercase tracking-widest">Escrowed</span>
                <span className="text-sm lg:text-2xl font-black text-accent-primary">{totalEscrowed.toFixed(0)} <span className="text-xs text-accent-secondary">XLM</span></span>
              </div>
              <div className="glass p-3 lg:p-4 rounded-2xl flex flex-col border-white/5 items-center lg:items-start text-center lg:text-left">
                <span className="text-[8px] lg:text-[10px] text-white/40 font-black uppercase tracking-widest">Agents</span>
                <span className="text-sm lg:text-2xl font-black text-accent-secondary">{activeCount}</span>
              </div>
              <div className="glass p-3 lg:p-4 rounded-2xl flex flex-col border-white/5 items-center lg:items-start text-center lg:text-left">
                <span className="text-[8px] lg:text-[10px] text-white/40 font-black uppercase tracking-widest">Success</span>
                <span className="text-sm lg:text-2xl font-black text-green-400">100%</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-0">
              <div className="relative w-[260px] h-[260px] md:w-[340px] md:h-[340px] flex items-center justify-center overflow-hidden rounded-full">
                <div className="absolute inset-0 z-0 overflow-hidden rounded-full bg-black">
                  <VoicePoweredOrb
                    isListening={isListening}
                    isThinking={isThinking}
                    audioLevel={0}
                  />
                </div>
                <motion.div 
                  animate={{ y: [-5, 5, -5], scale: isThinking ? [1, 1.05, 1] : 1 }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 1, repeat: Infinity } }}
                  className="absolute z-10 w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.2)] border-2 border-white/10"
                >
                  <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: 'url("/orb-bg.png")' }} />
                  <div className="absolute inset-0 bg-accent-primary/5 mix-blend-screen" />
                </motion.div>
              </div>

              <div className="text-center max-w-2xl min-h-[3rem] flex items-center justify-center z-10">
                {/* Transcript hidden for pure voice-first experience */}
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
                  {["Hire UI/UX", "Hire Developer", "Hire Copywriter", "Hire Researcher"].map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => sendMessage(`I need to ${s}`)}
                      className="bg-white/5 border border-white/5 rounded-lg p-1.5 flex flex-col items-start hover:border-accent-primary/50 cursor-pointer transition-all hover:bg-accent-primary/5 group"
                    >
                      <span className="text-[9px] font-bold truncate group-hover:text-accent-primary transition-colors">{s}</span>
                      <span className="text-[7px] text-white/30 uppercase">Marketplace</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minimalist Controls */}
            <div className="mx-auto w-full max-w-2xl flex flex-col items-center gap-4 z-10 pt-2 pb-4 relative">
              
              {/* Render Attached Files Pills globally so they are always visible */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/20 border border-accent-primary/30 text-white/90 text-xs font-bold">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-0.5 hover:bg-white/10 rounded-full ml-1">
                        <X className="w-3 h-3 text-white/60" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {showChat && (
                  <motion.form 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    onSubmit={handleSendMessage} className="w-full relative"
                  >
                    <input
                      type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                      placeholder={isThinking ? "Managing Agents..." : "Describe your project requirements..."}
                      disabled={isThinking} autoFocus
                      className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 pr-16 focus:outline-none focus:border-accent-primary text-md shadow-2xl backdrop-blur-xl"
                    />
                    <button type="submit" disabled={!inputText.trim() || isThinking} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-accent-primary text-white rounded-xl">
                      <Send className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl">
                {/* Global ATTACH Button */}
                <label className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:bg-white/10 text-white/50 cursor-pointer">
                  <Plus className="w-5 h-5" />
                  <input type="file" className="hidden" onChange={handleFileSelect} />
                </label>
                
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
          </>
        )}
      </main>
    </div>
    </>
  );
}
