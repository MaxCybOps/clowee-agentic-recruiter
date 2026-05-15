'use client';

import { motion } from 'framer-motion';

interface CloweeCoreProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function CloweeCore({ isListening, isSpeaking }: CloweeCoreProps) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Glow */}
      <motion.div
        className="absolute w-full h-full rounded-full bg-accent-primary/20 blur-3xl"
        animate={{
          scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.1, 1] : 1,
          opacity: isSpeaking ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Orb */}
      <motion.div
        className="relative w-48 h-48 rounded-full glass flex items-center justify-center overflow-hidden border-2 border-accent-primary/30 shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)]"
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
          borderColor: isSpeaking ? "rgba(139, 92, 246, 0.6)" : isListening ? "rgba(6, 182, 212, 0.6)" : "rgba(139, 92, 246, 0.3)",
        }}
      >
        {/* Animated Inner Gradients */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-accent-primary/40 via-transparent to-accent-secondary/40"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Core Light */}
        <div className="z-10 w-12 h-12 rounded-full bg-white blur-xl opacity-50" />
        
        {/* Wave Overlay (when speaking) */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 border-4 border-white/20 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
