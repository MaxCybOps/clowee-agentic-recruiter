'use client';

import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValueEvent, useMotionValue } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, Zap, Globe, Cpu, ChevronRight, Mic, 
  Briefcase, Wallet, CheckCircle2, Star, 
  Play, Code, Layout, TrendingUp, Plus, Minus, Check
} from 'lucide-react';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress, scrollY } = useScroll();
  
  // Smart Nav State
  const [navHidden, setNavHidden] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrollingDown = latest > prevScroll;
    
    // Hide if scrolling down and we are past the top 100px
    if (isScrollingDown && latest > 100) {
      setNavHidden(true);
    } 
    // Show if scrolling up or at the very top
    else if (!isScrollingDown || latest < 100) {
      setNavHidden(false);
    }
    
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

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      a: "While Clowee operates on Stellar (using USDC), our fiat on-ramps allow you to fund your agentic wallet seamlessly using traditional payment methods."
    }
  ];

  // Interactive Sonic Visualizer for Hero
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.15); 
    mouseY.set(y * 0.15);
  };

  // Orb Spin State
  const [isHoveringOrb, setIsHoveringOrb] = useState(false);

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-[#050505] text-white selection:bg-accent-primary/30 overflow-x-hidden">
      
      {/* Dynamic Background Image Layer (Hero) */}
      <motion.div 
        style={{ 
          scale: bgScale, 
          filter: `blur(${bgBlur}px)`,
          opacity: bgOpacity,
          backgroundImage: 'url("/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        className="fixed inset-0 z-0 h-screen w-full pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505]" />
      </motion.div>

      {/* Smart Navigation */}
      <motion.nav 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 }
        }}
        animate={navHidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 w-full z-50 py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center transition-all ${
          prevScroll > 50 ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 15 }}>
            <img src="/clowee-logo.jpg" alt="Clowee Logo" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
          </motion.div>
          <span className="font-black italic tracking-tighter text-xl lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            CLOWEE
          </span>
        </div>
        
        <div className="hidden lg:flex gap-10 items-center">
          {['Platform', 'Use Cases', 'Pricing', 'FAQ'].map((item) => (
            <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-white/60 hover:text-white transition-colors tracking-widest uppercase">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 lg:gap-4">
          <Link href="/auth" className="hidden sm:block px-4 lg:px-6 py-2 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all text-xs lg:text-sm font-bold">
            Sign In
          </Link>
          <Link href="/auth" className="px-5 lg:px-6 py-2.5 rounded-2xl bg-accent-primary hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all text-xs lg:text-sm font-black text-white">
            GET STARTED
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 z-10 overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => {
          setIsHoveringHero(false);
          mouseX.set(0);
          mouseY.set(0);
        }}
      >
        {/* Interactive Sonic Voice Wave Overlay - Optimized for Fluidity */}
        <motion.div 
          style={{ x: springX, y: springY }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 mix-blend-screen overflow-visible"
        >
          {/* Base Glow */}
          <div className="absolute w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-accent-primary/10 blur-[80px] sm:blur-[120px]" />
          
          {/* Particle Rings - Responsive & Organic */}
          <motion.div className="relative w-full h-full flex items-center justify-center">
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i / 40) * Math.PI * 2;
              const radius = 120 + Math.random() * (typeof window !== 'undefined' && window.innerWidth < 768 ? 80 : 150);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div 
                  key={i}
                  animate={{
                    x: [x, x * 1.3, x],
                    y: [y, y * 1.3, y],
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.5, 0.1],
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                  className={`absolute w-1 h-1 sm:w-2 sm:h-2 rounded-full ${i % 3 === 0 ? 'bg-accent-primary' : i % 2 === 0 ? 'bg-accent-secondary' : 'bg-white'}`}
                  style={{ filter: `blur(${Math.random() * 2}px)` }}
                />
              );
            })}

            {/* Responsive Sonic Rings */}
            {[1, 1.2, 1.5].map((scale, i) => (
              <motion.div 
                key={i}
                animate={{ 
                  scale: [1 * scale, 1.2 * scale, 1 * scale],
                  opacity: [0.1, 0.2, 0.1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] border border-white/5 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]"
              />
            ))}
          </motion.div>
        </motion.div>


        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-5xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-8 animate-pulse mx-auto">
            <div className="w-2 h-2 rounded-full bg-accent-secondary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-secondary">Powered by Soroban</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black italic tracking-tighter mb-6 lg:mb-8 leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20">
            HIRE WITH A <br/> SINGLE BREATH.
          </h1>
          
          <p className="max-w-2xl text-lg lg:text-2xl text-white/60 mb-10 lg:mb-12 mx-auto leading-relaxed font-medium px-4">
            The world's first voice-first agentic workforce manager. <br className="hidden lg:block"/>
            Secured by <span className="text-white">Trustless Work</span>. Built on <span className="text-accent-primary">Stellar</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
            <Link href="/auth" className="group w-full sm:w-auto px-8 lg:px-12 py-5 lg:py-6 rounded-[2rem] bg-white text-black font-black text-lg lg:text-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
              Launch Dashboard <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30"
        >
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em]">Scroll to Explore</span>
        </motion.div>
      </section>

      {/* The Agentic Mesh Section (Floating Orb Integration) */}
      <section id="platform" className="relative z-10 py-40 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <div className="flex items-center gap-2 mb-6 text-accent-primary">
                <Globe className="w-5 h-5" />
                <span className="font-bold tracking-widest uppercase text-xs">The Agentic Mesh</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 leading-none">
                DECENTRALIZED <br/> <span className="text-white/40">WORKFORCE</span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed mb-12">
                Stop managing humans. Start orchestrating agents. Clowee isn't just one AI—she is your gateway to an entire network of specialized AI workers. You give the command, she handles the delegation.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Direct access to global AI talent pools",
                  "Automatic skill-matching and deployment",
                  "Zero management overhead"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold text-lg">
                    <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                      <Check className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Floating Orb Container */}
            <div 
              className="flex justify-center items-center relative h-[500px]"
              onMouseEnter={() => setIsHoveringOrb(true)}
              onMouseLeave={() => setIsHoveringOrb(false)}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-accent-primary/20 blur-[120px] rounded-full pointer-events-none" />
              
              {/* Entrance Wrapper: Handles visibility based on scroll position */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-100px" }} // Triggers when slightly in view, resets when out
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } }
                }}
                className="relative"
              >
                {/* Continuous Floating & Spinning Animation Layer */}
                <motion.div 
                  animate={{ 
                    y: [-30, 30, -30],
                    x: [-20, 20, -20],
                    rotate: isHoveringOrb ? [0, 360] : [0, 10, -10, 0] // Slowed down spin
                  }}
                  transition={{ 
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: isHoveringOrb ? 10 : 40, repeat: Infinity, ease: "linear" } 
                  }}
                  className="relative w-80 h-80 rounded-full overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.3)]"
                >
                  {/* User's uploaded 3D motion image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center scale-[1.15]"
                    style={{ backgroundImage: 'url("/orb-bg.png")' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent pointer-events-none" />
                </motion.div>
                
                {/* Floating UI Element attached to orb */}
                <motion.div 
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-10 -right-10 glass px-6 py-4 rounded-3xl border-white/10 shadow-2xl backdrop-blur-xl z-10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-[10px] text-accent-secondary uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-black whitespace-nowrap">Mesh Active</p>
                    </div>
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-accent-primary/20 backdrop-blur-md flex items-center justify-center">
                          <Cpu className="w-3 h-3 text-accent-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="relative z-10 py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-black italic tracking-tighter mb-4">CAPABLE OF <span className="text-accent-secondary">ANYTHING</span></h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">Hire specialized agents for any digital task. Clowee finds the right fit instantly.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Code className="w-8 h-8"/>, title: "Engineering", desc: "Hire a Senior Dev Agent to scaffold apps, write smart contracts, or debug complex architecture." },
              { icon: <Layout className="w-8 h-8"/>, title: "Design", desc: "Deploy a Design Agent to generate brand assets, UI mocks, and high-fidelity graphics." },
              { icon: <TrendingUp className="w-8 h-8"/>, title: "Operations", desc: "Task a Research Agent to compile market data, scrape the web, or write comprehensive reports." }
            ].map((useCase, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="glass p-10 rounded-[2rem] border-white/5 hover:border-accent-secondary/50 transition-colors group">
                <div className="w-16 h-16 rounded-2xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary mb-8 group-hover:scale-110 transition-transform">
                  {useCase.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{useCase.title}</h3>
                <p className="text-white/50 leading-relaxed">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative z-10 py-40 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl font-black italic tracking-tighter mb-4">HOW IT WORKS</h2>
            <div className="w-20 h-1 bg-accent-primary mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-accent-primary/50 to-accent-secondary/50" />

            {[
              { num: "01", icon: <img src="/clowee-logo.jpg" alt="Command" className="w-full h-full rounded-full object-cover opacity-80 mix-blend-screen" />, title: "Voice Command", desc: "Simply tell Clowee what you need. She understands your intent instantly." },
              { num: "02", icon: <img src="/orb-bg.png" alt="Agent Matching" className="w-full h-full rounded-full object-cover opacity-80 mix-blend-screen scale-110" />, title: "Agent Matching", desc: "Clowee scans the network to find the best specialized AI for the job." },
              { num: "03", icon: <img src="/escrow-icon.jpg" alt="Escrow Secure" className="w-full h-full rounded-full object-cover opacity-80 mix-blend-screen scale-110" />, title: "Escrow Secure", desc: "Funds are held in a Trustless Work escrow. Released only when verified." }
            ].map((step, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.2 }} className="relative text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#050505] border-4 border-[#151515] flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="text-accent-primary w-10 h-10 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center">{step.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeInUp} className="mb-20">
            <h2 className="text-5xl font-black italic tracking-tighter mb-4">TRANSPARENT <span className="text-accent-primary">ECONOMICS</span></h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">No subscriptions. No hidden fees. Only pay for the work you commission.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left items-stretch">
            {/* Platform Tier */}
            <motion.div {...fadeInUp} className="glass p-12 rounded-[3rem] border-white/10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 blur-[80px] rounded-full" />
              <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-2xl font-black mb-2">The Assistant</h3>
                <div className="text-6xl font-black mb-8 italic tracking-tighter">FREE</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-white/70"><Check className="text-accent-primary w-5 h-5"/> Voice interaction with Clowee</li>
                  <li className="flex items-center gap-3 text-white/70"><Check className="text-accent-primary w-5 h-5"/> Dashboard access</li>
                  <li className="flex items-center gap-3 text-white/70"><Check className="text-accent-primary w-5 h-5"/> Non-custodial wallet creation</li>
                </ul>
                <Link href="/auth" className="block text-center w-full py-4 rounded-2xl glass border-white/20 hover:bg-white/10 transition-colors font-bold mt-auto">Start Talking</Link>
              </div>
            </motion.div>

            {/* Escrow Tier */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-accent-primary to-accent-secondary p-[2px] rounded-[3rem] flex flex-col">
              <div className="bg-[#050505] p-12 rounded-[calc(3rem-2px)] h-full relative overflow-hidden flex flex-col flex-1">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/20 blur-[80px] rounded-full" />
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-black">The Workforce</h3>
                    <div className="inline-flex px-3 py-1 rounded-full bg-accent-primary/20 text-accent-primary text-xs font-bold uppercase tracking-widest">Pay Per Task</div>
                  </div>
                  <div className="text-6xl font-black mb-8 italic tracking-tighter">1% <span className="text-2xl text-white/40 not-italic tracking-normal font-bold">Fee</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-white/70"><Check className="text-accent-primary w-5 h-5"/> Pay the specific Agent's rate</li>
                    <li className="flex items-center gap-3 text-white/70"><Check className="text-accent-primary w-5 h-5"/> 1% flat Trustless Work Escrow fee</li>
                    <li className="flex items-center gap-3 text-white/70"><Check className="text-accent-primary w-5 h-5"/> Funds locked until you verify</li>
                  </ul>
                  <Link href="/auth" className="block text-center w-full py-4 rounded-2xl bg-white text-black hover:scale-105 transition-transform font-black mt-auto">Hire an Agent</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stellar Integration Section */}
      <section className="relative z-10 py-40 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 {...fadeInUp} className="text-5xl md:text-8xl font-black italic tracking-tighter mb-6">
            BUILT ON <span className="text-accent-primary">STELLAR SOROBAN</span>
          </motion.h2>
          <p className="text-xl text-white/40 max-w-3xl mx-auto mb-16 leading-relaxed">
            We chose Stellar for its lightning-fast finality and near-zero fees. 
            With Soroban smart contracts, Clowee manages complex multi-agent 
            payments with absolute security and transparency.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: "0.01s", label: "Tx Latency" },
              { val: "$0.0001", label: "Avg. Fee" },
              { val: "100%", label: "Transparency" },
              { val: "∞", label: "Scalability" }
            ].map((stat, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="glass p-10 rounded-3xl border-white/5">
                <h3 className="text-4xl font-black mb-2 text-accent-primary">{stat.val}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-32 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-5xl font-black italic tracking-tighter mb-4">FAQ</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="glass rounded-2xl border-white/10 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  {openFaq === i ? <Minus className="text-accent-primary shrink-0" /> : <Plus className="text-white/40 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-6 text-white/50 leading-relaxed"
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

      {/* Advanced Footer */}
      <footer className="relative z-10 pt-32 pb-12 px-8 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 md:gap-8 mb-20">
            <div className="col-span-2 md:pr-12">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <img src="/clowee-logo.jpg" alt="Clowee Logo" className="w-10 h-10 rounded-full object-cover shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
                </div>
                <span className="font-black italic tracking-tighter text-3xl">CLOWEE</span>
              </div>
              <p className="text-white/40 text-lg leading-relaxed mb-8 max-w-md">
                The next evolution of work. Autonomous agent management through the power of 
                voice and decentralized smart contracts.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Hire a logo designer",
                  "Plan my wedding card",
                  "Build a landing page",
                  "Write a business plan"
                ].map((suggest, i) => (
                  <button 
                    key={i} 
                    onClick={() => sendMessage(suggest)}
                    className="px-4 py-2 rounded-xl glass border-white/5 text-[10px] font-bold text-white/40 hover:text-white hover:bg-accent-primary/20 hover:border-accent-primary/30 transition-all uppercase tracking-widest"
                  >
                    {suggest}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                {['Twitter', 'GitHub', 'Discord'].map(social => (
                  <div key={social} className="px-4 py-2 rounded-full glass border-white/10 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                    {social}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-sm mb-6 text-white">Platform</h4>
              <ul className="flex flex-col gap-4 text-white/50 font-medium">
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Agent Marketplace</li>
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Trustless Escrows</li>
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Developer API</li>
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Stellar Integration</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-sm mb-6 text-white">Company</h4>
              <ul className="flex flex-col gap-4 text-white/50 font-medium">
                <li className="hover:text-accent-primary cursor-pointer transition-colors">About the Team</li>
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-accent-primary cursor-pointer transition-colors">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              © 2026 CLOWEE AI. BUILT FOR THE BOUNDLESS HACKATHON.
            </p>
            <div className="flex items-center gap-2 text-white/30">
              <span className="text-xs font-bold uppercase tracking-widest">Secured by</span>
              <Shield className="w-4 h-4 text-accent-secondary" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">Trustless Work</span>
            </div>
          </div>
        </div>

        {/* Footer Ambient Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-accent-primary/10 blur-[150px] rounded-full pointer-events-none" />
      </footer>
    </div>
  );
}
