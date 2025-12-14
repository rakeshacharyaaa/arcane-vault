import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, BarChart2, Calendar, Edit2, LogOut, Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ActivityCalendar } from 'react-activity-calendar';
import { getUserProfile, updateUserProfile, send2FA } from "@/lib/api";
import { OTPModal } from "@/components/OTPModal";
import { EmailChangeModal } from "@/components/EmailChangeModal";

export default function ProfilePage() {
  const { user, pages, signOut, setUser } = useStore();
  const [, setLocation] = useLocation();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable2fa' | 'disable2fa' | null>(null);

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

  const activityData = pages.map(page => {
    let dateStr = new Date().toISOString().split('T')[0]; // Default to today
    try {
      if (page.updatedAt) {
        dateStr = new Date(page.updatedAt).toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn("Invalid date for page:", page.id, page.updatedAt);
    }
    return {
      date: dateStr,
      count: 1,
      level: 1
    };
  });

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

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

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

  const updateName = async () => {
    try {
      await updateUserProfile(user.email, { name: nameInput });
      setProfileData({ ...profileData, name: nameInput });
      setIsEditingName(false);
    } catch (e) {
      console.error("Failed to update name:", e);
    }
  };


  // Generate full year of data for GitHub-style heatmap
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const heatmapData = [];
  let currentDate = new Date(oneYearAgo);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    heatmapData.push({
      date: dateStr,
      count: 0,
      level: 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Merge actual activity
  const activityMap = new Map();
  pages.forEach(page => {
    try {
      const date = page.updatedAt
        ? new Date(page.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    } catch (e) {
      console.warn("Invalid date in heatmap:", page.updatedAt);
    }
  });

  const finalActivityData = heatmapData.map(day => {
    const count = activityMap.get(day.date) || 0;
    return {
      ...day,
      count,
      level: count > 0 ? (count > 5 ? 4 : Math.ceil(count / 2)) : 0
    };
  });

  const toggle2FA = async () => {
    const newState = !profileData?.isTwoFactorEnabled;
    if (newState) {
      // Enabling 2FA - need to verify first
      setPendingAction('enable2fa');
      setShowOTPModal(true);
    } else {
      // Disabling 2FA - also verify
      setPendingAction('disable2fa');
      setShowOTPModal(true);
    }
  };

  const handleOTPSuccess = async () => {
    if (pendingAction === 'enable2fa') {
      await updateUserProfile(user.email, { isTwoFactorEnabled: true });
      setProfileData({ ...profileData, isTwoFactorEnabled: true });
    } else if (pendingAction === 'disable2fa') {
      await updateUserProfile(user.email, { isTwoFactorEnabled: false });
      setProfileData({ ...profileData, isTwoFactorEnabled: false });
    }
    setPendingAction(null);
  };

  return (
    <div className="flex h-full w-full relative overflow-y-auto scrollbar-hide">


      <div className="w-full max-w-4xl mx-auto space-y-8 pb-48 md:pb-32 p-6 md:p-10 lg:p-12 relative z-10">

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

            <div className="text-center md:text-left flex-1 w-full max-w-[200px] md:max-w-none mx-auto md:mx-0">
              {isEditingName ? (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 w-full">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-neutral-900 border border-emerald-500/50 rounded px-2 py-1 text-xl md:text-2xl font-bold text-white focus:outline-none focus:ring-2 ring-emerald-500 w-full min-w-0"
                    autoFocus
                  />
                  <button onClick={updateName} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-500 flex-shrink-0"><Check className="w-5 h-5" /></button>
                  <button onClick={() => setIsEditingName(false)} className="p-1 hover:bg-red-500/20 rounded text-red-500 flex-shrink-0"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3 group w-full">
                  <span className="truncate max-w-[200px] md:max-w-md">{profileData?.name || user.email?.split('@')[0]}</span>
                  <Edit2
                    className="w-4 h-4 text-neutral-400 md:text-neutral-600 group-hover:text-emerald-500 cursor-pointer transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                    onClick={() => {
                      setNameInput(profileData?.name || user.email?.split('@')[0] || "");
                      setIsEditingName(true);
                    }}
                  />
                </h1>
              )}
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
              data={finalActivityData}
              blockSize={12}
              blockMargin={4}
              blockRadius={3}
              fontSize={14}
              showWeekdayLabels
              weekStart={1}
              labels={{
                totalCount: '{{count}} activities in the last year'
              }}
              theme={{
                light: ['#303030', '#0e4429', '#006d32', '#26a641', '#39d353'],
                dark: ['#303030', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
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
              <button onClick={() => setShowEmailModal(true)} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Change</button>
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

        {/* Explicit Spacer for Mobile Navigation */}
        <div className="h-48 md:h-0 w-full" />
      </div>

      {/* Modals */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => { setShowOTPModal(false); setPendingAction(null); }}
        email={user.email}
        onSuccess={handleOTPSuccess}
      />
      <EmailChangeModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={user.email}
      />
    </div>
  );
}
