import { motion } from 'framer-motion';
import { Star, Shield, Zap, Code, PenTool, Layout } from 'lucide-react';

const MARKETPLACE_AGENTS = [
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'UI/UX Designer',
    grade: 'Intermediate',
    cost: 15,
    icon: <Layout className="w-8 h-8 text-pink-400" />,
    description: 'Specializes in modern, glassmorphic interfaces and user experience flows.',
    successRate: '98%'
  },
  {
    id: 'syntax',
    name: 'Syntax',
    role: 'Web Developer',
    grade: 'Advanced',
    cost: 30,
    icon: <Code className="w-8 h-8 text-blue-400" />,
    description: 'Full-stack Next.js developer. Writes production-ready, highly optimized code.',
    successRate: '99%'
  },
  {
    id: 'scout',
    name: 'Scout',
    role: 'Researcher',
    grade: 'Beginner',
    cost: 5,
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    description: 'Lightning-fast data collection and competitive analysis.',
    successRate: '95%'
  },
  {
    id: 'scribe',
    name: 'Scribe',
    role: 'Copywriter',
    grade: 'Intermediate',
    cost: 10,
    icon: <PenTool className="w-8 h-8 text-emerald-400" />,
    description: 'Crafts compelling copy for landing pages, blogs, and marketing materials.',
    successRate: '97%'
  }
];

export function Marketplace() {
  return (
    <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar pb-32">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">Agent Marketplace</h1>
        <p className="text-white/60 max-w-2xl">Browse the available AI talent. When you are ready to hire, just ask Clowee to negotiate the scope and deploy the escrow. You cannot hire them directly; Clowee manages the entire workforce for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MARKETPLACE_AGENTS.map((agent, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={agent.id}
            className="glass rounded-3xl p-6 border-white/5 relative overflow-hidden group hover:border-accent-primary/50 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold font-mono text-accent-primary border border-white/5">
                {agent.cost} XLM
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
              {agent.icon}
            </div>

            <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
            <div className="text-accent-secondary font-mono text-sm mb-4">{agent.role}</div>
            
            <p className="text-white/70 text-sm mb-6 min-h-[40px]">
              {agent.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Grade</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                  <Shield className="w-3.5 h-3.5 text-white/50" />
                  {agent.grade}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Success Rate</span>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  {agent.successRate}
                </div>
              </div>
            </div>

            {/* Lock overlay to show user can't click */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col">
              <span className="text-white font-bold tracking-tight mb-2">Speak to Clowee to Hire</span>
              <span className="text-white/60 text-xs text-center max-w-[200px]">Only the Orchestrator can deploy funds and manage tasks.</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
