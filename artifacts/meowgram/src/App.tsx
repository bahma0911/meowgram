import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import PostDetail from "./pages/PostDetail";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/upload" component={Upload} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/post/:id" component={PostDetail} />
        <Route path="/profile/:userId" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_popup") === "1") {
      // Signal the opener via localStorage (works even if opener is cross-origin cleared)
      localStorage.setItem("meowgram_auth_ts", Date.now().toString());
      // Also try postMessage directly
      try {
        if (window.opener) {
          window.opener.postMessage({ type: "meowgram-auth-complete" }, "*");
        }
      } catch {}
      window.close();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
