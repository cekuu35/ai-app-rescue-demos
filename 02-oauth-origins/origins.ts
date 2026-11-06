// 02-oauth-origins — one source of truth for every origin the app runs on.
//
// BROKEN: Site URL still points at the builder's preview domain, and only the
// localhost callback is registered with Google. Production login loops;
// the URL bar shows redirect_uri_mismatch or the session cookie is missing.
//
// FIXED: one table of origins, and the provider console entries are generated
// from it — so "did we register the production URL?" is answerable in one
// look. Remember: providers do NOT accept wildcards. Each Vercel/Netlify
// preview deployment is its own origin and needs its own entry.

export const ORIGINS = {
  production: "https://your-app.com",
  local: "http://localhost:3000",
  // Reference only — enumerate real preview URLs and register each one:
  // https://<deploy-id>-<team>.vercel.app
} as const;

type Provider = "google" | "github";

export function callbackUrls(provider: Provider): string[] {
  const path = `/auth/callback/${provider}`;
  return [ORIGINS.production, ORIGINS.local].map((o) => `${o}${path}`);
}

// Deploy-time check: print the URLs that must exist in the provider console
// so a missing registration is caught before a user hits the login loop.
export function redirectChecklist(provider: Provider = "google"): string[] {
  console.log(`Register these redirect URIs with ${provider}:`);
  return callbackUrls(provider).map((url) => {
    console.log(`  - ${url}`);
    return url;
  });
}
