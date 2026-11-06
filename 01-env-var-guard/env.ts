// 01-env-var-guard — fail the BUILD, not the runtime.
//
// BROKEN (the default in most AI-scaffolded apps):
//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL   // undefined in prod
//   Fails at runtime with: Uncaught Error: supabaseUrl is required
//   (or worse: builds fine, breaks only for users on the real domain)
//
// FIXED: parse once, fail the build. A missing var now stops `next build`
// instead of shipping `undefined` to production.
import { z } from "zod";

const serverSchema = z.object({
  // Server-only. Never prefixed with NEXT_PUBLIC_.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
});

const clientSchema = z.object({
  // NEXT_PUBLIC_* are inlined into the browser bundle at BUILD time:
  // changing them in the host requires a redeploy, not just a save.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  // Deliberately loud: CI/deploy dies here with the exact missing keys.
  console.error(
    "Missing or invalid client env vars:\n" +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  throw new Error("env: required NEXT_PUBLIC_* variables are missing");
}

const parsedServer = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
});

if (!parsedServer.success) {
  console.error(
    "Missing or invalid server env vars:\n" +
      JSON.stringify(parsedServer.error.flatten().fieldErrors, null, 2)
  );
  throw new Error("env: required server variables are missing");
}

export const env = { ...parsed.data, ...parsedServer.data };
export type Env = typeof env;
