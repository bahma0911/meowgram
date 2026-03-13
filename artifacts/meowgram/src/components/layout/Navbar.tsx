import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Cat, Home, Trophy, PlusSquare, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "";
  const initials = displayName.slice(0, 2).toUpperCase() || "??";

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Cat className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Meowgram
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
            <Trophy className="w-4 h-4" /> Leaderboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link href="/upload">
                <Button variant="default" size="sm" className="hidden sm:flex rounded-full gap-2 shadow-md shadow-primary/20">
                  <PlusSquare className="w-4 h-4" /> Create Post
                </Button>
              </Link>
              <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>
              <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:bg-muted/50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-border">
                <Avatar className="w-8 h-8 border border-background shadow-sm">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold hidden md:block">{displayName}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => login()} className="rounded-full shadow-md shadow-primary/20 gap-2">
              <LogIn className="w-4 h-4" /> Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
