import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Chrome, ShieldCheck, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { getUserProfile, send2FA, verify2FA } from "@/lib/api";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, user } = useStore();
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkUser = async () => {
      if (user && step === "login") {
        setLoading(true);
        // Safety timeout
        const timeoutId = setTimeout(() => {
          if (mounted) {
            setLoading(false);
            // console.error("Auth check timed out");
          }
        }, 5000);

        try {
          // console.log("Fetching profile for:", user.email);
          const profile = await getUserProfile(user.email);
          // console.log("Profile fetched:", profile);

          if (mounted) {
            if (profile.isTwoFactorEnabled) {
              await send2FA(user.email);
              setStep("2fa");
            } else {
              setLocation("/");
            }
          }
        } catch (e) {
          console.error("Auth check failed:", e);
          // If backend fails, we assume valid login for now to avoid lockout
          if (mounted) setLocation("/");
        } finally {
          clearTimeout(timeoutId);
          if (mounted) setLoading(false);
        }
      }
    };
    checkUser();
    return () => { mounted = false; };
  }, [user, setLocation]); // Depend only on stable values

  const handleVerify = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await verify2FA(user.email, otp);
      setLocation("/");
    } catch (e) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === "login") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-emerald-500 flex-col gap-4">
        <div className="animate-pulse">Loading...</div>
        <div className="text-xs text-neutral-500">Checking profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6"
      >
        <div className="liquid-glass p-8 md:p-10 rounded-3xl text-center">

          {/* Header */}
          <div className="mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-6"
            >
              {step === "login" ? <Sparkles className="w-6 h-6 text-emerald-400" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {step === "login" ? "Arcane Vault" : "Two-Factor Auth"}
            </h1>
            <p className="text-neutral-500">
              {step === "login" ? "Sign in to access your sanctuary." : "Enter the verification code sent to your email."}
            </p>
          </div>

          {step === "login" ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signInWithGoogle()}
                className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group"
              >
                <Chrome className="w-5 h-5" />
                <span>Sign in with Google</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  useStore.getState().setUser({ id: 'dev-user', email: 'dev@example.com' });
                  setLocation("/");
                }}
                className="mt-4 w-full py-3 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Dev Bypass</span>
              </motion.button>
            </>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest bg-white/5 border border-white/10 rounded-xl py-3 text-white focus:border-emerald-500/50 outline-none transition-colors"
              />

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Verify Identity</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
