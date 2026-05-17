import { motion } from 'framer-motion';
import { Settings, Shield, Loader2, CheckCircle2, ChevronRight, FileCode2, ExternalLink } from 'lucide-react';

interface WorkerAgent {
  id: string;
  name: string;
  task: string;
  status: string;
}

interface WorkshopProps {
  workers: WorkerAgent[];
  onViewDeliverable?: (worker: WorkerAgent) => void;
}

export function Workshop({ workers, onViewDeliverable }: WorkshopProps) {
  return (
    <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar pb-32">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">The Workshop</h1>
        <p className="text-white/60 max-w-2xl">Live view of your active AI workforce. Watch them execute tasks in real-time and review their finalized deliverables here.</p>
      </div>

      <div className="space-y-4">
        {workers.length === 0 ? (
          <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center border-dashed border-white/10">
            <Settings className="w-12 h-12 text-white/20 mb-4 animate-spin-slow" />
            <h3 className="text-xl font-bold mb-2">Factory Floor is Empty</h3>
            <p className="text-white/50 max-w-sm">No agents are currently hired. Speak to Clowee to delegate a project and start production.</p>
          </div>
        ) : (
          workers.map((worker) => (
            <motion.div 
              key={worker.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border-white/5 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Agent Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30 shrink-0">
                    <Shield className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      {worker.name}
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
                        {worker.id}
                      </span>
                    </h4>
                    <p className="text-sm text-white/60">{worker.task}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-4 md:w-1/3 justify-end shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Status</span>
                    {worker.status.toLowerCase() === 'completed' ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-accent-primary font-bold text-sm bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="truncate max-w-[150px]">{worker.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Deliverable Action */}
                  <div className="w-12 flex justify-end">
                     {worker.status.toLowerCase() === 'completed' ? (
                       <button 
                         onClick={() => onViewDeliverable && onViewDeliverable(worker)}
                         className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                         title="View Deliverable"
                       >
                         <FileCode2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                       </button>
                     ) : (
                       <div className="p-3 bg-white/5 rounded-xl opacity-50 cursor-not-allowed">
                         <Settings className="w-5 h-5 text-white/30 animate-spin-slow" />
                       </div>
                     )}
                  </div>
                </div>
              </div>

              {/* Progress Bar visual */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                <motion.div 
                  className={`h-full ${worker.status.toLowerCase() === 'completed' ? 'bg-emerald-400' : 'bg-accent-primary'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: worker.status.toLowerCase() === 'completed' ? '100%' : '60%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
