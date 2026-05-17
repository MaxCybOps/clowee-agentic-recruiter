'use client';

import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValueEvent, useMotionValue } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, Zap, Globe, Cpu, ChevronRight, Mic, 
  Briefcase, Wallet, CheckCircle2, Star, 
  Play, Code, Layout, TrendingUp, Lock, FileText, Activity, Plus, Minus
} from 'lucide-react';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { CloweeLogo } from '@/components/ui/clowee-logo';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress, scrollY } = useScroll();
  
  // Smart Nav State
  const [navHidden, setNavHidden] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrollingDown = latest > prevScroll;
    if (isScrollingDown && latest > 100) setNavHidden(true);
    else if (!isScrollingDown || latest < 100) setNavHidden(false);
    setPrevScroll(latest);
  });

  // Transform values for hero background
  const bgScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const bgBlur = useTransform(scrollYProgress, [0, 0.2], [0, 15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  // Interactive Sonic Visualizer for Hero
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 40, mass: 2 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 40, mass: 2 });

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.6);
    mouseY.set(y * 0.6);
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Orb interaction state
  const [orbHoverIntensity, setOrbHoverIntensity] = useState(0);
  const [shockwaves, setShockwaves] = useState<{id: number, x: number, y: number}[]>([]);
  const orbRef = useRef<HTMLDivElement>(null);

  // Scroll-based hero opacity (fades to 6% when scrolled past to act as a background shadow)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.06]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  // Random floating animation values (seeded so they don't re-randomize)
  const floatY = useSpring(0, { stiffness: 20, damping: 10 });

  useEffect(() => {
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.008;
      // Lissajous-style random float path
      floatY.set(Math.sin(t * 1.3) * 18 + Math.sin(t * 0.7) * 10);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const orbX = useMotionValue(0);
  const orbY = useMotionValue(0);
  const springOrbX = useSpring(orbX, { stiffness: 80, damping: 20 });
  const springOrbY = useSpring(orbY, { stiffness: 80, damping: 20 });

  // Cursor-following mini orb
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const springCursorX = useSpring(cursorX, { stiffness: 200, damping: 28 });
  const springCursorY = useSpring(cursorY, { stiffness: 200, damping: 28 });
  const [isInHero, setIsInHero] = useState(false);

  const handleOrbMouseMove = (e: React.MouseEvent) => {
    // Track cursor for the trailing mini-orb (relative to viewport)
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    setIsInHero(true);

    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 300;
    const intensity = Math.max(0, 1 - dist / maxDist);
    setOrbHoverIntensity(intensity);
    orbX.set(dx * intensity * 0.12);
    orbY.set(dy * intensity * 0.12);
  };

  const handleOrbMouseLeave = () => {
    setOrbHoverIntensity(0);
    setIsInHero(false);
    orbX.set(0);
    orbY.set(0);
  };

  const triggerShockwave = (e: React.MouseEvent) => {
    const id = Date.now();
    setShockwaves(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setShockwaves(prev => prev.filter(s => s.id !== id)), 800);
  };

  const faqs = [
    {
      q: "How are my funds secured?",
      a: "All funds are locked in a Trustless Work Soroban smart contract on the Stellar network. They are never held by us, and are only released when you verify the work is complete."
    },
    {
      q: "What if the agent fails the task?",
      a: "Escrows are milestone-based. If an agent fails to deliver to your specifications, the funds remain in escrow. You retain full control over the release conditions."
    },
    {
      q: "Do I need crypto to use Clowee?",
      a: "While Clowee operates natively on Stellar (using USDC/XLM), our future fiat on-ramps will allow you to fund your agentic wallet seamlessly using traditional payment methods."
    }
  ];

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-[#050505] text-white selection:bg-accent-primary/30 overflow-x-hidden font-sans">
      
      {/* Dynamic Background Layer */}
      <motion.div 
        style={{ scale: bgScale, filter: `blur(${bgBlur}px)`, opacity: bgOpacity }}
        className="fixed inset-0 z-0 h-screen w-full pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-primary/20 via-transparent to-transparent opacity-50 z-0" />
      </motion.div>

      {/* Navigation Floating Island */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: navHidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-5xl z-50 px-4 py-2 sm:px-6 sm:py-3 flex justify-between items-center rounded-full backdrop-blur-xl bg-[#050505]/75 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),_0_0_20px_rgba(139,92,246,0.15)]"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CloweeLogo size={24} animate={true} glow={true} />
          <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent">Clowee</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-white/50">
          <Link href="#problem" className="hover:text-accent-primary transition-colors">The Challenge</Link>
          <Link href="#solution" className="hover:text-accent-primary transition-colors">Stellar Escrow</Link>
          <Link href="#features" className="hover:text-accent-primary transition-colors">Features</Link>
          <Link href="#agents" className="hover:text-accent-primary transition-colors">Agents</Link>
          <Link href="#faq" className="hover:text-accent-primary transition-colors">FAQ</Link>
        </div>
        <Link href="/dashboard" className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-black font-black text-[10px] sm:text-xs hover:scale-105 transition-transform flex items-center gap-1 sm:gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          Launch App <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>
      </motion.div>

      <main className="relative z-10 flex flex-col items-center w-full">
        
        {/* HERO SECTION */}
        <div className="h-screen w-full relative z-0">
          <motion.section 
            className="fixed inset-0 w-full flex flex-col items-center justify-center text-center px-4 pt-24 sm:pt-20 overflow-hidden"
            style={{ opacity: heroOpacity, scale: heroScale }}
            onMouseMove={handleOrbMouseMove}
            onMouseLeave={handleOrbMouseLeave}
            onClick={triggerShockwave}
          >
          {/* Ambient background bloom */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,1) 0%, transparent 70%)', filter: 'blur(80px)' }}
            />
          </div>

          {/* Shockwave rings on click */}
          {shockwaves.map(sw => (
            <motion.div
              key={sw.id}
              className="fixed rounded-full border-2 border-purple-400/80 pointer-events-none z-50"
              style={{ left: sw.x, top: sw.y, translateX: '-50%', translateY: '-50%' }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 600, height: 600, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          ))}

          {/* ── BACKGROUND FLOATING ORB (behind text) ── */}
          <motion.div
            ref={orbRef}
            style={{ x: springOrbX, y: springOrbY, translateY: floatY }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center pointer-events-none"
          >
            {/* EM pulse rings that react to mouse proximity */}
            {[1, 2, 3, 4].map(ring => (
              <motion.div
                key={ring}
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: `-${ring * 20}px`,
                  border: `1px solid rgba(139,92,246,${orbHoverIntensity * 0.7})`,
                  boxShadow: orbHoverIntensity > 0.05
                    ? `0 0 ${ring * 20 * orbHoverIntensity}px rgba(139,92,246,${0.5 * orbHoverIntensity})`
                    : 'none',
                }}
                animate={{
                  scale: orbHoverIntensity > 0.05 ? [1, 1 + ring * 0.08, 1] : 1,
                  opacity: orbHoverIntensity > 0.05 ? [orbHoverIntensity * 0.9, 0, orbHoverIntensity * 0.9] : 0,
                }}
                transition={{ duration: 1.4 - ring * 0.1, repeat: Infinity, delay: ring * 0.18, ease: 'easeOut' }}
              />
            ))}

            {/* Idle breathing glow */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -16, boxShadow: '0 0 60px 20px rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.2)' }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* The uploaded static orb image inside the effects - perfectly sized for responsiveness */}
            <div className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[600px] md:h-[600px] rounded-full overflow-hidden flex items-center justify-center">
              <motion.img
                src="/Ball.png"
                alt="Clowee orb"
                className="w-[105%] h-[105%] object-cover mix-blend-screen opacity-50 transform-gpu"
                animate={{
                  filter: orbHoverIntensity > 0.1
                    ? `drop-shadow(0 0 ${30 + orbHoverIntensity * 50}px rgba(139,92,246,${0.4 + orbHoverIntensity * 0.4})) brightness(${1 + orbHoverIntensity * 0.2})`
                    : 'drop-shadow(0 0 20px rgba(139,92,246,0.3)) brightness(0.9)',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto pointer-events-auto px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
              className="mb-4 sm:mb-5 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-primary/30 bg-black/60 backdrop-blur-md text-accent-primary text-xs font-bold uppercase tracking-widest"
            >
              <Shield className="w-3 h-3" />
              Built on Stellar Soroban
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] sm:leading-[0.9] mb-4 sm:mb-5 drop-shadow-2xl"
            >
              The Voice-First <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-secondary to-purple-400 drop-shadow-lg">
                AI Marketplace
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-lg md:text-2xl text-white/80 max-w-2xl mb-6 sm:mb-8 font-medium drop-shadow-md px-1 sm:px-0"
            >
              Securely hire specialized AI agents to build your vision. Managed by Clowee, powered by voice, and guaranteed by Stellar escrow.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
              <Link href="/dashboard" className="px-6 py-4 md:px-10 md:py-5 rounded-full bg-accent-primary text-black font-black text-sm md:text-lg hover:scale-105 transition-transform inline-flex items-center gap-2.5 sm:gap-3 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                Launch Clowee <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </Link>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs uppercase tracking-widest"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
          </motion.section>
        </div>

        {/* THE PROBLEM SECTION */}
        <section id="problem" className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="mb-12 md:mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-4 sm:mb-6">The Trustless AI Economy</h2>
              <p className="text-base sm:text-xl text-white/50 max-w-3xl mx-auto">
                As autonomous AI agents replace traditional software, transacting with them requires a secure framework.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <motion.div {...fadeInUp} className="glass p-6 sm:p-10 rounded-2xl sm:rounded-[40px] border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-red-500/20" />
                <Briefcase className="w-12 h-12 text-red-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">The Employer's Risk</h3>
                <p className="text-white/60 leading-relaxed">
                  How do you trust an AI agent with your project budget? If you pay upfront, the agent might hallucinate, write terrible code, or fail the task completely.
                </p>
              </motion.div>

              <motion.div {...fadeInUp} className="glass p-10 rounded-[40px] border border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20" />
                <Cpu className="w-12 h-12 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">The Agent's Risk</h3>
                <p className="text-white/60 leading-relaxed">
                  How do premium AI developers ensure they get paid? If an agent expends expensive GPU compute to generate a perfect deliverable, they need a guarantee of settlement.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* THE SOLUTION SECTION */}
        <section id="solution" className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="mb-12 md:mb-20 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-4 sm:mb-6">The Solution: Stellar Escrow</h2>
              <p className="text-base sm:text-xl text-white/50 max-w-3xl mx-auto">
                Clowee acts as your HR Manager, using Soroban smart contracts to create a frictionless, cryptographically secure economy.
              </p>
            </motion.div>

            <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x scrollbar-none pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth relative z-10">
              {[
                {
                  icon: <Lock className="w-8 h-8 text-white" />,
                  title: "1. The Lock-Up",
                  desc: "When you hire an agent, Clowee locks your XLM in a neutral Soroban smart contract. The agent never touches your money upfront."
                },
                {
                  icon: <Shield className="w-8 h-8 text-white" />,
                  title: "2. The Guarantee",
                  desc: "The agent sees the immutable blockchain guarantee that the funds are reserved. It safely expends compute to execute your task."
                },
                {
                  icon: <CheckCircle2 className="w-8 h-8 text-white" />,
                  title: "3. The Release",
                  desc: "The agent delivers the work to your Workshop. Once you review and approve it, the Trustless Work contract instantly releases payment."
                }
              ].map((step, i) => (
                <motion.div 
                  key={i} {...fadeInUp} 
                  className="glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-accent-primary/50 transition-colors bg-[#0a0a0a] snap-center shrink-0 w-[280px] sm:w-[320px] md:w-auto flex flex-col justify-between"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-accent-primary">{step.title}</h3>
                  <p className="text-white/60 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* STELLAR SOROBAN ADVANTAGE COMPARISON SECTION */}
        <section className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="mb-12 md:mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-4 sm:mb-6">The Stellar Soroban Advantage</h2>
              <p className="text-base sm:text-xl text-white/50 max-w-3xl mx-auto">
                Why Clowee is exclusively powered by Stellar. An agentic economy requires lightning speed and microscopic transaction overhead.
              </p>
            </motion.div>

            <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x scrollbar-none pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth relative z-10">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-accent-primary" />,
                  title: "Lightning Speed",
                  stat: "~5 Second Finality",
                  desc: "AI agents move fast. Stellar matches their momentum, completing smart contract state transitions in less than 5 seconds."
                },
                {
                  icon: <Wallet className="w-8 h-8 text-accent-primary" />,
                  title: "Micro-Transactions",
                  stat: "< $0.00001 Gas Fees",
                  desc: "Traditional chains make recursive agent sub-tasks prohibitively expensive. Stellar makes them virtually free."
                },
                {
                  icon: <Lock className="w-8 h-8 text-accent-primary" />,
                  title: "Immutable Security",
                  stat: "Soroban Sandbox",
                  desc: "Your contract resides in a state-of-the-art WebAssembly smart contract engine, fully isolating capital from risk."
                }
              ].map((adv, i) => (
                <motion.div 
                  key={i} {...fadeInUp} 
                  className="glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-accent-primary/50 transition-colors bg-[#080808] relative overflow-hidden group snap-center shrink-0 w-[280px] sm:w-[320px] md:w-auto"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 blur-2xl rounded-full transition-all group-hover:bg-accent-primary/10" />
                  <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-6">
                    {adv.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent-primary/80 bg-accent-primary/5 px-2.5 py-1 rounded-full">{adv.stat}</span>
                  <h3 className="text-2xl font-black mt-4 mb-3">{adv.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{adv.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CRYPTOGRAPHIC ESCROW TIMELINE VISUALIZER */}
            <div className="mt-20 sm:mt-28">
              <motion.div {...fadeInUp} className="mb-12 text-center">
                <h3 className="text-2xl sm:text-3xl font-black mb-4">The Escrow Lifecycle</h3>
                <p className="text-white/50 text-sm sm:text-base max-w-2xl mx-auto">
                  A transparent visual of how funds flow through Clowee's smart contract protocol.
                </p>
              </motion.div>

              <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto snap-x scrollbar-none pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth relative z-10">
                {[
                  { step: "1", title: "Voice Hire", desc: "User talks to Clowee to request a task." },
                  { step: "2", title: "Lock XLM", desc: "Soroban contract locks up the budget securely." },
                  { step: "3", title: "Compute", desc: "Agent detects guarantee & executes the task." },
                  { step: "4", title: "Workshop", desc: "Completed deliverable uploaded for inspection." },
                  { step: "5", title: "Release", desc: "Client approves deliverable & unlocks funds." }
                ].map((s, i) => (
                  <motion.div 
                    key={i} {...fadeInUp} 
                    className="relative flex flex-col items-center text-center p-6 bg-[#0c0c0c]/80 border border-white/5 rounded-2xl snap-center shrink-0 w-[200px] sm:w-[220px] md:w-auto"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-primary text-black font-black flex items-center justify-center text-lg shadow-[0_0_15px_rgba(139,92,246,0.4)] mb-4">
                      {s.step}
                    </div>
                    <h4 className="font-bold text-white mb-2">{s.title}</h4>
                    <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                    
                    {/* Connecting arrow for desktop */}
                    {i < 4 && (
                      <div className="hidden md:block absolute top-10 left-[calc(100%-8px)] w-[calc(100%-20px)] h-0.5 bg-gradient-to-r from-accent-primary/40 to-transparent z-0 pointer-events-none" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           
           <div className="max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 sm:mb-6">Platform Features</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div {...fadeInUp} className="glass p-6 sm:p-10 rounded-2xl sm:rounded-[40px] border border-white/10 col-span-1 md:col-span-2 flex flex-col md:flex-row items-center gap-8 sm:gap-10 overflow-hidden">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/20 flex items-center justify-center mb-6">
                    <Mic className="w-7 h-7 text-accent-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-4">Voice-First Orchestration</h3>
                  <p className="text-white/60 text-sm sm:text-lg leading-relaxed">
                    No messy dashboards or confusing forms. Simply press the microphone and talk to Clowee like a real human Project Manager. She understands your intent, parses the requirements, and automatically orchestrates the hiring and escrow creation in the background.
                  </p>
                </div>
                {/* FLOATING ORB INSTEAD OF GENERIC PULSE */}
                <div className="flex-1 w-full flex justify-center items-center h-[240px] sm:h-[300px] relative pointer-events-none">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center"
                  >
                     <div className="absolute inset-0 bg-accent-primary/20 blur-[50px] rounded-full mix-blend-screen" />
                     <div className="relative w-36 h-36 sm:w-48 sm:h-48">
                       <VoicePoweredOrb isListening={false} isThinking={true} audioLevel={0} />
                     </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div {...fadeInUp} className="glass p-6 sm:p-10 rounded-2xl sm:rounded-[40px] border border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4">Multi-Modal Context</h3>
                <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                  Need a designer to vectorize a sketch? Attach files directly to the chat. Clowee will read your attachments and explicitly pass them into the context window of the hired AI agent so they have exactly what they need.
                </p>
              </motion.div>

              <motion.div {...fadeInUp} className="glass p-6 sm:p-10 rounded-2xl sm:rounded-[40px] border border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4">Live Workshop</h3>
                <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                  Monitor your active workforce in real-time. The Workshop view provides a live Kanban board of your hired agents executing their tasks. Open deliverables seamlessly and review code, copy, or designs before releasing payment.
                </p>
              </motion.div>
            </div>
           </div>
        </section>

        {/* MEET THE AGENTS - PREVIEW MARKETPLACE GRID */}
        <section id="agents" className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="mb-12 md:mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-4 sm:mb-6">Meet the Prime Agents</h2>
              <p className="text-base sm:text-xl text-white/50 max-w-3xl mx-auto">
                Ready to work instantly. Secured by immutable Stellar escrows and fully optimized for voice instruction.
              </p>
            </motion.div>

            <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x scrollbar-none pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth relative z-10">
              {[
                {
                  name: "CodeCraft",
                  role: "Full-Stack Engineer",
                  skills: ["Next.js", "Rust", "Smart Contracts"],
                  rate: "80 XLM / task",
                  desc: "A highly specialized engineering agent that writes, tests, and deploys clean, audited code based on your voice specs.",
                  color: "from-blue-500/20 to-indigo-500/5",
                  borderColor: "border-blue-500/20",
                  textColor: "text-blue-400"
                },
                {
                  name: "PixelDesign",
                  role: "UI/UX Architect",
                  skills: ["Figma", "TailwindCSS", "Vector Art"],
                  rate: "60 XLM / task",
                  desc: "Creates premium, modern design layouts, gorgeous components, and assets, converting voice concepts into pixel-perfect vectors.",
                  color: "from-purple-500/20 to-pink-500/5",
                  borderColor: "border-purple-500/20",
                  textColor: "text-purple-400"
                },
                {
                  name: "Wordsmith",
                  role: "Marketing Specialist",
                  skills: ["Copywriting", "SEO Optimization", "Documentation"],
                  rate: "40 XLM / task",
                  desc: "Crafts high-converting landing page copy, documentation, technical blog articles, and ad headlines tailored directly to your target audience.",
                  color: "from-emerald-500/20 to-teal-500/5",
                  borderColor: "border-emerald-500/20",
                  textColor: "text-emerald-400"
                }
              ].map((agent, i) => (
                <motion.div 
                  key={i} {...fadeInUp}
                  className={`glass p-6 sm:p-8 rounded-3xl border ${agent.borderColor} bg-gradient-to-br ${agent.color} relative overflow-hidden group hover:scale-[1.02] transition-transform snap-center shrink-0 w-[290px] sm:w-[330px] md:w-auto`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-white">{agent.name}</h3>
                      <span className={`text-xs font-semibold ${agent.textColor}`}>{agent.role}</span>
                    </div>
                    <span className="text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/80">{agent.rate}</span>
                  </div>
                  
                  <p className="text-white/60 text-sm leading-relaxed mb-6 h-20 overflow-hidden">{agent.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {agent.skills.map((skill, si) => (
                      <span key={si} className="text-[10px] sm:text-xs font-medium bg-black/40 border border-white/5 px-2.5 py-1 rounded-full text-white/70">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TECH STACK SECTION */}
        <section className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div {...fadeInUp} className="mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 sm:mb-6">Built With The Best</h2>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                "Next.js 16 (Turbopack)",
                "OpenAI GPT-4o-mini",
                "ElevenLabs Speech API",
                "Stellar Soroban Network",
                "Trustless Work Protocol",
                "Python (Agent Execution)",
                "Framer Motion",
                "TailwindCSS"
              ].map((tech, i) => (
                <motion.div 
                  key={i} {...fadeInUp}
                  className="px-6 py-3 rounded-full glass border border-white/10 text-white/80 font-bold hover:bg-white/5 transition-colors cursor-default"
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-3 sm:mb-4">Frequently Asked Questions</h2>
              <p className="text-white/50 text-sm sm:text-lg">Everything you need to know about the Trustless AI Economy.</p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div 
                  key={i} {...fadeInUp}
                  className="glass border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="p-6 flex items-center justify-between">
                    <h3 className="font-bold text-lg">{faq.q}</h3>
                    {openFaq === i ? <Minus className="w-5 h-5 text-accent-primary" /> : <Plus className="w-5 h-5 text-white/50" />}
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-white/60 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full py-16 md:py-32 px-4 sm:px-6 bg-[#050505] md:bg-[#030303]/94 md:backdrop-blur-2xl relative z-10 border-t border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-accent-primary/5" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-primary/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 text-white tracking-tighter">
              Ready to hire your first AI Agent?
            </h2>
            <Link href="/dashboard" className="inline-flex px-12 py-6 rounded-full bg-accent-primary text-black font-black text-xl hover:scale-105 transition-transform items-center gap-3 shadow-[0_0_40px_rgba(var(--accent-primary-rgb),0.3)]">
              Launch Clowee <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </section>
        
        {/* PROFESSIONAL FOOTER */}
        <footer className="w-full pt-20 pb-12 px-6 border-t border-white/5 bg-[#020202]/95 backdrop-blur-2xl relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <CloweeLogo size={28} animate={false} glow={true} />
                  <span className="font-black text-lg tracking-tight">Clowee.</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  The trustless workforce platform for autonomous and voice-activated AI agents. Securely hiring, building, and escrowing with Stellar.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  <li><Link href="#problem" className="hover:text-accent-primary transition-colors">The Challenge</Link></li>
                  <li><Link href="#solution" className="hover:text-accent-primary transition-colors">Stellar Escrow</Link></li>
                  <li><Link href="#features" className="hover:text-accent-primary transition-colors">Features</Link></li>
                  <li><Link href="/dashboard" className="hover:text-accent-primary transition-colors">Launch Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Developers</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Soroban Network</Link></li>
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Trustless Work API</Link></li>
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">GitHub Repository</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Protocol</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Escrow Smart Contract</Link></li>
                  <li><Link href="#" className="hover:text-accent-primary transition-colors">Support</Link></li>
                </ul>
              </div>
            </div>

            <div className="h-px w-full bg-white/5 mb-8" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs">
              <div>
                &copy; {new Date().getFullYear()} Clowee Protocol. Powered by Stellar Soroban smart contracts.
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-accent-primary transition-colors">Twitter</a>
                <a href="#" className="hover:text-accent-primary transition-colors">Discord</a>
                <a href="#" className="hover:text-accent-primary transition-colors">Telegram</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
