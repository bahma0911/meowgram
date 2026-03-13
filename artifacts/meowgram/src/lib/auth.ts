export function doLogin() {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
  const url = `/api/login?returnTo=${encodeURIComponent(base)}`;
  if (window.top && window.top !== window) {
    window.top.location.href = url;
  } else {
    window.location.href = url;
  }
}

export function doLogout() {
  const url = "/api/logout";
  if (window.top && window.top !== window) {
    window.top.location.href = url;
  } else {
    window.location.href = url;
  }
}
