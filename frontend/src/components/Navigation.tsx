import React from "react";
import { Link, useLocation } from "wouter";
import { Book, User, LogOut, Sparkles, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import appIcon from "@/assets/app-icon.jpg";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Book, label: "Vault" },
    { href: "/graph", icon: Sparkles, label: "Graph" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 md:left-0 md:bg-transparent md:backdrop-blur-none md:border-none md:w-20 md:h-screen md:static bg-black/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl md:rounded-none flex md:flex-col items-center justify-between z-50 md:py-8 md:shadow-none shadow-[0_4px_30px_rgba(0,0,0,0.5)] bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.15),transparent_70%)] md:bg-none">

      {/* Logo Area */}
      <div className="hidden md:flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden">
          <img src={appIcon} alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Links */}
      <div className="flex md:flex-col items-center justify-around w-full md:w-auto md:gap-8 p-4 md:p-0">

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="relative group p-3 flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-300">
                <Menu className="w-6 h-6" />
                <span className="text-[10px] font-medium">Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 bg-black/95 backdrop-blur-xl border-r border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-white bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_40%)]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Main mobile navigation menu</SheetDescription>
              <Sidebar className="w-full h-full !bg-transparent !border-none !shadow-none" />
            </SheetContent>
          </Sheet>
        </div>

        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className="relative group p-3 flex flex-col items-center gap-1">
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <link.icon
                className={`w-6 h-6 relative z-10 transition-colors duration-300 ${isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-neutral-300"
                  }`}
              />
              <span className="md:hidden text-[10px] font-medium text-neutral-500">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Area (Placeholder for future items like settings/logout) */}
      <div className="hidden md:flex flex-col items-center">
        {/* Items removed to prevent duplication */}
      </div>
    </nav>
  );
}
