import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cat, Loader2, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

interface LoginModalProps {
  onSuccess: () => void;
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onShow() { setOpen(true); setMode("login"); setError(""); }
    window.addEventListener("meowgram:show-login", onShow);
    return () => window.removeEventListener("meowgram:show-login", onShow);
  }, []);

  function reset() {
    setUsername(""); setPassword(""); setConfirmPassword("");
    setFirstName(""); setError(""); setShowPassword(false);
  }

  function switchMode(m: Mode) { setMode(m); setError(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/local-auth/login" : "/api/local-auth/register";
      const body: Record<string, string> = { username, password };
      if (mode === "register" && firstName) body.firstName = firstName;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setOpen(false);
      reset();
      onSuccess();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogContent className="sm:max-w-md rounded-3xl border-border/60 shadow-2xl p-0 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Cat className="w-9 h-9 text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-foreground">
              {mode === "login" ? "Welcome back!" : "Join Meowgram"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Log in to rate, like and share cats"
              : "Create your free account today"}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-border/50">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "register" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Display Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="firstName"
                placeholder="e.g. Cat Lover"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-xl"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="e.g. whiskers42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="rounded-xl"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full rounded-xl py-5 text-base font-bold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {mode === "login" ? "Log In" : "Create Account"}
          </Button>

          <p className="text-center text-xs text-muted-foreground pb-2">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button type="button" onClick={() => switchMode("register")} className="text-primary font-semibold hover:underline">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-primary font-semibold hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
