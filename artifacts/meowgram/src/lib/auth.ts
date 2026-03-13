const AUTH_COMPLETE_KEY = "meowgram_auth_ts";

function openAuthPopup(url: string) {
  const w = 500, h = 650;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  const popup = window.open(url, "meowgram_auth", `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);

  if (!popup) {
    // Popup blocked — fall back to same-window navigation
    window.location.href = url;
    return;
  }

  const baseline = localStorage.getItem(AUTH_COMPLETE_KEY);

  function cleanup() {
    clearInterval(poll);
    window.removeEventListener("message", onMessage);
    localStorage.removeItem(AUTH_COMPLETE_KEY);
  }

  function finish() {
    cleanup();
    try { popup.close(); } catch {}
    window.location.reload();
  }

  // Fast path: postMessage from popup
  function onMessage(e: MessageEvent) {
    if (e.data?.type === "meowgram-auth-complete") finish();
  }
  window.addEventListener("message", onMessage);

  // Fallback: localStorage polling (survives cross-origin redirects that clear opener)
  const poll = setInterval(() => {
    const val = localStorage.getItem(AUTH_COMPLETE_KEY);
    if (val && val !== baseline) {
      finish();
      return;
    }
    // User closed the popup without finishing
    if (popup.closed) cleanup();
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
