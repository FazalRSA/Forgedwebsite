import { createClient } from '@supabase/supabase-js';

/**
 * The customer account backend. It is the SAME Supabase project as the FORGEDSA configurator
 * (forged-configurator.vercel.app), so one Google account is one user, one profile and one garage on
 * both sites. Both values are the project's public (browser-safe) address and publishable key: what a
 * visitor can read or change is decided by row-level security in the database, not by hiding the key.
 * VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY override them for a different project.
 *
 * This module is imported only by the account page's own chunk, so no other page downloads it.
 */
const DEFAULT_URL = 'https://qxlfkfhzpqbxffuqqewg.supabase.co';
const DEFAULT_KEY = 'sb_publishable_K6StjjlsyguXl4EUOsGk9w_nkmbTUQj';

function readViteEnv(): Record<string, string | undefined> {
  try {
    return (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  } catch {
    return {};
  }
}

const env = readViteEnv();

export const SUPABASE_URL = env.VITE_SUPABASE_URL?.trim() || DEFAULT_URL;
export const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || DEFAULT_KEY;

/**
 * PKCE: Google sends the visitor back with a one-time `?code=` that this client swaps for the session,
 * so no token ever appears in the address bar or the history (the configurator, built earlier, uses the
 * implicit flow and has to scrub the fragment itself).
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
});
