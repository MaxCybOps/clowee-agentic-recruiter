'use client';

import { motion } from 'framer-motion';

interface CloweeLogoProps {
  size?: number; // pixel size
  glow?: boolean;
  animate?: boolean;
  className?: string;
}

export function CloweeLogo({ size = 32, glow = true, animate = true, className = '' }: CloweeLogoProps) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* Outer pulsing glow ring */}
      {animate && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-accent-primary pointer-events-none"
        />
      )}
      {/* Static glow bloom */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 ${size * 0.6}px rgba(139,92,246,0.5)` }}
        />
      )}
      {/* The orb image */}
      <img
        src="/clowee-logo.jpg"
        alt="Clowee"
        className="w-full h-full rounded-full object-cover"
        style={{ boxShadow: glow ? `0 0 ${size * 0.4}px rgba(139,92,246,0.4)` : 'none' }}
      />
    </div>
  );
}
