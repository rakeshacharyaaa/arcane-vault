import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Simulate API call
    setTimeout(() => {
      login(email);
      setLocation("/");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),rgba(0,0,0,0)_50%)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6"
      >
        <div className="glass-panel p-8 md:p-10 rounded-3xl">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-6"
            >
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Arcane Vault</h1>
            <p className="text-neutral-500">
              {isLogin ? "Welcome back to your sanctuary." : "Begin your journey."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-hidden focus:bg-white/10 focus:border-emerald-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-hidden focus:bg-white/10 focus:border-emerald-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-emerald-500 text-emerald-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isLogin ? "Enter Vault" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-neutral-500 hover:text-emerald-400 transition-colors"
            >
              {isLogin ? "No account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
