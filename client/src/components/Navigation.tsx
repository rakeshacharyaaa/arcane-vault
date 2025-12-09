import React from "react";
import { Link, useLocation } from "wouter";
import { Book, User, LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Book, label: "Vault" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:w-20 md:h-screen md:static bg-neutral-950/50 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center justify-between z-50 md:py-8">
      
      {/* Logo Area */}
      <div className="hidden md:flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
           <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Links */}
      <div className="flex md:flex-col items-center justify-around w-full md:w-auto md:gap-8 p-4 md:p-0">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <a className="relative group p-3 flex flex-col items-center gap-1">
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon 
                  className={`w-6 h-6 relative z-10 transition-colors duration-300 ${
                    isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-neutral-300"
                  }`} 
                />
                <span className="md:hidden text-[10px] font-medium text-neutral-500">{link.label}</span>
              </a>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="hidden md:flex flex-col items-center">
        <Link href="/auth">
          <a className="p-3 text-neutral-500 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5" title="Logout">
            <LogOut className="w-5 h-5" />
          </a>
        </Link>
      </div>
    </nav>
  );
}
