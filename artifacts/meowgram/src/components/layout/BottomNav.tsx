import { Link, useLocation } from "wouter";
import { Home, Trophy, PlusSquare, LogIn, User } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { doLogin } from "@/lib/auth";

export function BottomNav() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const active = (path: string) =>
    location === path ? "text-primary" : "text-muted-foreground";

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/50 flex items-stretch h-16 safe-bottom">
      <Link href="/" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${active("/")}`}>
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link href="/leaderboard" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${active("/leaderboard")}`}>
        <Trophy className="w-5 h-5" />
        <span>Leaderboard</span>
      </Link>

      {isAuthenticated ? (
        <Link href="/upload" className="flex-1 flex flex-col items-center justify-center gap-0.5">
          <div className="bg-primary rounded-full p-2 -mt-6 shadow-lg shadow-primary/30 border-4 border-background">
            <PlusSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-0.5">Post</span>
        </Link>
      ) : (
        <button
          onClick={() => doLogin()}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted-foreground"
        >
          <div className="bg-primary rounded-full p-2 -mt-6 shadow-lg shadow-primary/30 border-4 border-background">
            <PlusSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="mt-0.5">Post</span>
        </button>
      )}

      {isAuthenticated && user ? (
        <Link href={`/profile/${user.id}`} className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${location.startsWith("/profile") ? "text-primary" : "text-muted-foreground"}`}>
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      ) : (
        <button
          onClick={() => doLogin()}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted-foreground"
        >
          <LogIn className="w-5 h-5" />
          <span>Log In</span>
        </button>
      )}
    </nav>
  );
}
