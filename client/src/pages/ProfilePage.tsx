import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, BarChart2, Calendar, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const stats = [
    { label: "Total Notes", value: "42", icon: BarChart2 },
    { label: "Words Written", value: "12.5k", icon: Edit2 },
    { label: "Days Active", value: "15", icon: Calendar },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden p-6 md:p-10 lg:p-12">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-black border-2 border-white/10 flex items-center justify-center shadow-xl">
              <User className="w-10 h-10 text-neutral-400" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-black shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Alex Voidwalker</h1>
            <p className="text-neutral-500 flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Premium Vault Member
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
          >
            Edit Profile
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                <stat.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-sm font-medium text-white">Email Address</div>
                  <div className="text-xs text-neutral-500">alex@voidwalker.com</div>
                </div>
              </div>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Change</button>
            </div>

             <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-sm font-medium text-white">Security</div>
                  <div className="text-xs text-neutral-500">Two-factor authentication enabled</div>
                </div>
              </div>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Manage</button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
