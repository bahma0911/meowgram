export function doLogin() {
  window.dispatchEvent(new CustomEvent("meowgram:show-login"));
}

export async function doLogout() {
  try {
    await fetch("/api/local-auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}
  window.dispatchEvent(new CustomEvent("meowgram:auth-changed"));
}
