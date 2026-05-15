'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mic, ArrowRight, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Save name for personalization if in signup mode, otherwise use a default or existing one
    if (!isLogin && name) {
      localStorage.setItem('clowee_user_name', name);
    }

    // Simulate auth delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#050505]">
      
      {/* Left Side: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/hero-bg.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/clowee-logo.jpg" alt="Clowee Logo" className="w-12 h-12 rounded-full object-cover shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
            <span className="font-black italic tracking-tighter text-3xl text-white">CLOWEE</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary">Stellar Network</span>
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white mb-6 leading-tight">
            THE FUTURE OF <br/> <span className="text-white/40">DECENTRALIZED WORK</span>
          </h2>
          <p className="text-lg text-white/60 leading-relaxed font-medium">
            Join the agentic revolution. Orchestrate AI workers, secure payments with Soroban smart contracts, and build the impossible.
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none" />
        
        <motion.div 
          key={isLogin ? 'login' : 'signup'} // forces re-animation on toggle
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          {/* Mobile Logo (Only visible on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/clowee-logo.jpg" alt="Clowee Logo" className="w-10 h-10 rounded-full object-cover shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
              <span className="font-black italic tracking-tighter text-2xl text-white">CLOWEE</span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black mb-3">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
            <p className="text-white/40 text-lg">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Start orchestrating your agentic workforce today.'}
            </p>
          </div>

          <div className="glass p-6 sm:p-10 rounded-[2rem] border-white/10 shadow-2xl relative overflow-hidden">
            <form onSubmit={handleAuth} className="flex flex-col gap-6 relative z-10">
              
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/60 ml-1 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all font-medium"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white/60 ml-1 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all font-medium"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-widest">Password</label>
                  {isLogin && <a href="#" className="text-xs text-accent-primary hover:text-white transition-colors font-bold">Forgot?</a>}
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all font-medium"
                />
              </div>

              <button 
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-white text-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>{isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center relative z-10">
              <p className="text-sm text-white/40">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-white font-bold hover:text-accent-primary transition-colors">
                  {isLogin ? "Create one now" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-white/20 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-accent-primary" />
            Secure non-custodial authentication
          </p>
        </motion.div>
      </div>
    </div>
  );
}
