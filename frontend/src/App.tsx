import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";

import AuthPage from "@/pages/AuthPage";
import VaultPage from "@/pages/VaultPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";
import AstralGraph from "@/components/AstralGraph";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

import { supabase } from "@/lib/supabase";

function App() {
  const [location, setLocation] = useLocation();
  const { fetchPages, subscribeToPages, setUser, user } = useStore();
  const isAuthPage = location === "/auth";
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);

      const isCallback = window.location.search.includes("code=") || window.location.hash.includes("access_token=");
      if (!session?.user && !isAuthPage && !isCallback) {
        setLocation("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      const isCallback = window.location.search.includes("code=") || window.location.hash.includes("access_token=");

      if (!session?.user && !isAuthPage) {
        if (!isCallback) setLocation("/auth");
      } else if (session?.user && location === "/auth") {
        setLocation("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLocation, isAuthPage, location]);

  useEffect(() => {
    if (!user) return;
    fetchPages();
    const unsubscribe = subscribeToPages();
    return () => { unsubscribe(); };
  }, [user, fetchPages, subscribeToPages]);

  if (isCheckingAuth) {
    return <div className="flex h-screen items-center justify-center bg-black text-emerald-500 font-mono">Loading Vault...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />

      <div className="flex h-screen w-full overflow-hidden bg-black text-neutral-200 font-sans relative">
        {/* Global Mesh Gradient Background */}
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url('/image-mesh-gradient2.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Background Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0 mix-blend-overlay"></div>

        {/* Global Navigation - Only show if not on auth page */}
        {!isAuthPage && <Navigation />}

        {/* Main Content Area */}
        <div className="flex-1 relative z-10 h-full overflow-hidden">
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={VaultPage} />
            <Route path="/page/:id" component={VaultPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/graph" component={AstralGraph} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
