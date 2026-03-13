function openAuthPopup(url: string) {
  const w = 500, h = 650;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  const popup = window.open(url, "meowgram_auth", `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);

  if (!popup) {
    window.location.href = url;
    return;
  }

  const handler = (e: MessageEvent) => {
    if (e.data?.type === "meowgram-auth-complete") {
      window.removeEventListener("message", handler);
      popup.close();
      window.location.reload();
    }
  };
  window.addEventListener("message", handler);
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
