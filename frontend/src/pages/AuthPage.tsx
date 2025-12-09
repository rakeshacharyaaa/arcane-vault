import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Chrome } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, user } = useStore();

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

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
        <div className="glass-panel p-8 md:p-10 rounded-3xl text-center">

          {/* Header */}
          <div className="mb-10">
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
              Sign in to access your sanctuary.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signInWithGoogle()}
            className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group"
          >
            <Chrome className="w-5 h-5" />
            <span>Sign in with Google</span>
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}
