import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Terminal, FileText, Globe, Users, Zap } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (command: string, args: string) => void;
}

export function CommandPalette({ isOpen, onClose, onExecute }: CommandPaletteProps) {
  const [input, setInput] = useState('');

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && input.trim()) {
        const [cmd, ...rest] = input.split(':');
        onExecute(cmd.trim().toLowerCase(), rest.join(':').trim());
        setInput('');
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, input, onClose, onExecute]);

  const suggestions = [
    { icon: <Terminal className="w-4 h-4 text-accent-primary" />, cmd: 'delegate:', desc: 'Hire a background worker (e.g., delegate: researcher for stellar docs)' },
    { icon: <FileText className="w-4 h-4 text-emerald-400" />, cmd: 'notepad:', desc: 'Open native Notepad and draft content' },
    { icon: <Globe className="w-4 h-4 text-blue-400" />, cmd: 'research:', desc: 'Scan a URL natively (e.g., research: github.com)' },
    { icon: <Zap className="w-4 h-4 text-yellow-400" />, cmd: 'trace:', desc: 'Start recording a new skill trace' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Input Area */}
              <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/5">
                <Command className="w-5 h-5 text-accent-primary mr-3 opacity-70" />
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a command or press ESC to close..."
                  className="w-full bg-transparent text-white placeholder-white/30 outline-none text-sm font-mono"
                />
              </div>

              {/* Suggestions */}
              <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                  Quick Actions
                </div>
                {suggestions
                  .filter(s => s.cmd.includes(input.toLowerCase().split(':')[0]))
                  .map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion.cmd + ' ');
                        // Need to keep focus on input, but React makes this tricky without a ref.
                        // For now, we rely on the user continuing to type.
                      }}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="p-1.5 rounded-md bg-white/5 border border-white/5 group-hover:border-white/10 mr-3">
                        {suggestion.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{suggestion.cmd}</div>
                        <div className="text-[10px] text-white/40">{suggestion.desc}</div>
                      </div>
                    </button>
                  ))}
              </div>
              
              <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex items-center justify-between">
                <div className="flex gap-4">
                  <span className="text-[9px] text-white/40 font-mono"><span className="border border-white/10 rounded px-1 py-0.5 bg-white/5 text-white/60">↵</span> to execute</span>
                  <span className="text-[9px] text-white/40 font-mono"><span className="border border-white/10 rounded px-1 py-0.5 bg-white/5 text-white/60">ESC</span> to dismiss</span>
                </div>
                <div className="text-[9px] text-accent-primary font-black uppercase tracking-widest">
                  OpenJarvis Kernel
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
