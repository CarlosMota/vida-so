export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

  // Encode both origin and optional return path so the callback can redirect properly
  const statePayload = JSON.stringify({ origin: window.location.origin, returnPath: returnPath ?? "/dashboard" });
  const state = btoa(statePayload);

  if (!oauthPortalUrl || !appId) {
    // Local/dev fallback: hit backend callback directly so session cookie is created.
    // This avoids a no-op redirect to the current page when OAuth portal envs are missing.
    return `${backendBaseUrl}/api/oauth/callback?code=demo-code&state=${encodeURIComponent(state)}`;
  }

  // OAuth provider must return to backend callback, not frontend origin.
  const redirectUri = `${backendBaseUrl}/api/oauth/callback`;

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
