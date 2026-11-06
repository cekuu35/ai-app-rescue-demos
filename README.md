# AI App Rescue — before/after demos

Minimal, reproducible examples of the ways AI-built apps (Lovable, Bolt.new,
v0, Cursor, Replit) break when they leave the preview — and the fixes.

**The four non-security seams** (the fifth — RLS/keys — is a separate
security service, not covered here):

1. **Environment variables** — the host's env panel is not the builder's
   panel. `NEXT_PUBLIC_*` values bake into the bundle at build time, so they
   need the host value *and* a fresh deploy. The failure is silent in preview
   and fatal in production: `Uncaught Error: supabaseUrl is required`.
2. **OAuth redirect origins** — the provider console (Google/GitHub) and the
   app's Site URL must both point at the production domain. Neither accepts
   wildcards, so every preview deploy URL needs its own entry.
3. **Stripe webhooks** — the endpoint registered in the dashboard and the
   signing secret must both come from LIVE mode against the production URL.
   A test-mode secret on a live endpoint fails signature verification
   silently.
4. **Edge Function CORS** — Deno-served functions don't add CORS headers for
   you. `OPTIONS` preflight + explicit origin headers, or the browser blocks
   the call only in production (preview is same-origin).

## Demos

| Folder | Seam | Shows |
|---|---|---|
| `01-env-var-guard/` | env vars | zod schema that fails the build when a required var is missing |
| `02-oauth-origins/` | OAuth | one origin table that generates every provider redirect URL |

## How I work

Free first step: send your app URL, I record a 10-minute teardown — what's
broken, the log line that proves it, fix order. Fixed price if you want it
fixed: SOS Fix $99 (one issue, same day) · Full Rescue $249 (all issues, 48h)
· Ship-Ready Pass $599 (+ 30-day recheck). "No finding, no fee."

— Cenk Kurtoglu · GMT+3 (your evening brief → fixed app by your morning)
