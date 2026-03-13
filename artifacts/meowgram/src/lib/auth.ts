export const AUTH_COMPLETE_KEY = "meowgram_auth_ts";

function openAuthPopup(url: string) {
  const w = 500, h = 650;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  const popup = window.open(
    url,
    "meowgram_auth",
    `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  );

  if (!popup) {
    // Popup blocked — fall back to same-window navigation
    window.location.href = url;
    return;
  }

  function finish() {
    cleanup();
    try { popup.close(); } catch {}
    // Dispatch a custom event on this window so useAuth can re-fetch
    window.dispatchEvent(new CustomEvent("meowgram:auth-changed"));
  }

  function cleanup() {
    window.removeEventListener("message", onMessage);
    window.removeEventListener("storage", onStorage);
    clearInterval(poll);
  }

  // 1. postMessage — fastest, works if opener survives the redirect
  function onMessage(e: MessageEvent) {
    if (e.data?.type === "meowgram-auth-complete") finish();
  }
  window.addEventListener("message", onMessage);

  // 2. storage event — fires in THIS window when the popup writes to localStorage
  function onStorage(e: StorageEvent) {
    if (e.key === AUTH_COMPLETE_KEY && e.newValue) finish();
  }
  window.addEventListener("storage", onStorage);

  // 3. polling fallback — catches anything the above miss, and handles popup dismissal
  const baseline = localStorage.getItem(AUTH_COMPLETE_KEY);
  const poll = setInterval(() => {
    if (popup.closed) { cleanup(); return; }
    const val = localStorage.getItem(AUTH_COMPLETE_KEY);
    if (val && val !== baseline) finish();
  }, 500);
}

export function doLogin() {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
  const returnTo = `${base}?auth_popup=1`;
  openAuthPopup(`/api/login?returnTo=${encodeURIComponent(returnTo)}`);
}

export function doLogout() {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
  const returnTo = `${base}?auth_popup=1`;
  openAuthPopup(`/api/logout?returnTo=${encodeURIComponent(returnTo)}`);
}
