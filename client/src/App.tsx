import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";

import AuthPage from "@/pages/AuthPage";
import VaultPage from "@/pages/VaultPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

function App() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-neutral-200 font-sans">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0 mix-blend-overlay"></div>

        {/* Global Navigation - Only show if not on auth page */}
        {!isAuthPage && <Navigation />}

        {/* Main Content Area */}
        <div className="flex-1 relative z-10 h-full overflow-hidden">
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={VaultPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
