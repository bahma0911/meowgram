function navigate(url: string) {
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // window.top is cross-origin (e.g. Replit workspace) — fall through
  }
  window.location.href = url;
}

export function doLogin() {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
  navigate(`/api/login?returnTo=${encodeURIComponent(base)}`);
}

export function doLogout() {
  navigate("/api/logout");
}
