import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, BarChart2, Calendar, Edit2, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ActivityCalendar } from 'react-activity-calendar';
import { getUserProfile, updateUserProfile } from "@/lib/api";

export default function ProfilePage() {
  const { user, pages, signOut, setUser } = useStore();
  const [, setLocation] = useLocation();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setTimeout(() => setLocation("/auth"), 0);
    } else {
      // Fetch extended profile data
      getUserProfile(user.email).then(setProfileData).catch(console.error);
    }
  }, [user, setLocation]);

  if (!user) return null;

  // Calculate Stats
  const totalPages = pages.length;
  const totalWords = pages.reduce((acc, page) => {
    return acc + Math.floor(JSON.stringify(page.content).length / 6);
  }, 0);

  const formattedWords = totalWords > 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords;
  const daysActive = user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: false }) : "1 day";

  const stats = [
    { label: "Total Pages", value: totalPages.toString(), icon: BarChart2 },
    { label: "Words Written", value: formattedWords.toString(), icon: Edit2 },
    { label: "Member Since", value: daysActive, icon: Calendar },
  ];

  const handleLogout = () => {
    signOut();
    setLocation("/auth");
  };

  const activityData = pages.map(page => ({
    date: new Date(page.updatedAt).toISOString().split('T')[0],
    count: 1,
    level: 1
  }));

  const avatars = [
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Leo&backgroundColor=022c22&clothingColor=10b981&accessoriesColor=34d399",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=064e3b&clothingColor=34d399&accessoriesColor=10b981",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Max&backgroundColor=065f46&clothingColor=6ee7b7&accessoriesColor=34d399",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Ava&backgroundColor=022c22&clothingColor=34d399&accessoriesColor=10b981",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=064e3b&clothingColor=10b981&accessoriesColor=6ee7b7",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Mia&backgroundColor=065f46&clothingColor=34d399&accessoriesColor=10b981",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Jace&backgroundColor=022c22&clothingColor=6ee7b7&accessoriesColor=34d399",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Lily&backgroundColor=064e3b&clothingColor=10b981&accessoriesColor=34d399"
  ];

  const updateAvatar = async (url: string) => {
    try {
      console.log("Updating avatar for:", user.email, "to", url);
      const res = await updateUserProfile(user.email, { avatarUrl: url });
      console.log("Update response:", res);
      setProfileData({ ...profileData, avatarUrl: url });
      setIsEditingAvatar(false);
    } catch (e) {
      console.error("Failed to update avatar:", e);
    }
  };

  const toggle2FA = async () => {
    try {
      const newState = !profileData?.isTwoFactorEnabled;
      await updateUserProfile(user.email, { isTwoFactorEnabled: newState });
      setProfileData({ ...profileData, isTwoFactorEnabled: newState });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative overflow-y-auto">


      <div className="w-full max-w-4xl mx-auto space-y-8 pb-20 p-6 md:p-10 lg:p-12 relative z-10">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-3xl flex flex-col md:flex-row items-center gap-8 relative z-20"
        >
          {/* Background Glow Container - Isolated to prevent clipping dropdowns */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          </div>

          <div className="p-8 flex flex-col md:flex-row items-center gap-8 w-full relative z-10">
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-black border-2 border-white/10 flex items-center justify-center shadow-xl overflow-hidden cursor-pointer relative"
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              >
                {profileData?.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{(user?.email || "?").charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Edit Badge - Always Visible */}
              <button
                className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white shadow-lg hover:bg-neutral-700 transition-colors z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingAvatar(!isEditingAvatar);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Status Dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20 pointer-events-none" />
            </div>

            {isEditingAvatar && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 mt-2 md:mt-4 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl z-50 flex gap-2 flex-wrap max-w-xs shadow-2xl min-w-[200px] justify-center">
                {avatars.map(url => (
                  <button key={url} onClick={() => updateAvatar(url)} className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 ring-emerald-500 transition-all">
                    <img src={url} alt="Avatar option" className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{user.email?.split('@')[0]}</h1>
              <p className="text-neutral-500 flex items-center justify-center md:justify-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                {profileData?.isPremium ? "Premium Vault Member" : "Vault Member"}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="liquid-glass p-6 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 group"
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

        {/* Heatmap Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="liquid-glass p-8 rounded-3xl"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-500" />
            Activity Heatmap
          </h2>
          <div className="w-full overflow-x-auto pb-2">
            <ActivityCalendar
              data={activityData}
              theme={{
                light: ['#404040', '#0e4429', '#006d32', '#26a641', '#39d353'],
                dark: ['#404040', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              labels={{
                legend: {
                  less: 'Less',
                  more: 'More',
                },
                months: [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ],
                totalCount: '{{count}} activities in {{year}}',
                weekdays: [
                  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
                ]
              }}
              colorScheme="dark"
              maxLevel={4}
            />
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="liquid-glass p-8 rounded-3xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-sm font-medium text-white">Email Address</div>
                  <div className="text-xs text-neutral-500">{user.email}</div>
                </div>
              </div>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Change</button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-sm font-medium text-white">Security</div>
                  <div className="text-xs text-neutral-500">
                    {profileData?.isTwoFactorEnabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled"}
                  </div>
                </div>
              </div>
              <button onClick={toggle2FA} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                {profileData?.isTwoFactorEnabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
