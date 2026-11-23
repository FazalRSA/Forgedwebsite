import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  Build,
  CatalogueNames,
  Profile,
  ProfilePatch,
  deleteBuild as deleteBuildCall,
  deleteMyAccount as deleteMyAccountCall,
  exportMyData as exportMyDataCall,
  fetchProfile,
  listBuilds,
  loadCatalogueNames,
  renameBuild as renameBuildCall,
  saveProfile as saveProfileCall,
} from '../utils/accountService';

/**
 * The customer's account on this site: Google sign-in through Supabase Auth, the profile and the garage
 * of saved builds. It is the configurator's account (same project, same tables), so a customer who signed
 * in there finds the same profile and builds here after one click on "Continue with Google".
 *
 * Mounted by the account page only, so Supabase is not loaded anywhere else on the site.
 */

interface AccountContextValue {
  user: User | null;
  /** False until Supabase has said whether a session exists (and a returning Google sign-in is complete). */
  authReady: boolean;
  profile: Profile | null;
  builds: Build[];
  names: CatalogueNames;
  /** True while the profile and builds are being loaded after sign-in. */
  loadingData: boolean;
  /** The last problem to show the customer (sign-in or loading); cleared by the next attempt. */
  error: string | null;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (patch: ProfilePatch) => Promise<void>;
  renameBuild: (code: string, name: string) => Promise<void>;
  deleteBuild: (code: string) => Promise<void>;
  /** The JSON export of everything stored about the customer. */
  exportMyData: () => Promise<unknown>;
  deleteMyAccount: () => Promise<void>;
  reloadBuilds: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

const EMPTY_NAMES: CatalogueNames = { cars: {}, paints: {}, wheels: {}, finishes: {} };

/** Takes the one-time code and state Google's return left in the address out of the address bar and history entry. */
function tidyReturnUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ['code', 'state', 'error', 'error_code', 'error_description']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (/(^#|&)(access_token|refresh_token|error_description)=/.test(url.hash)) {
    url.hash = '';
    changed = true;
  }
  if (changed) window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
}

/** The message a failed Google return carries in its address, if any (read before it is tidied away). */
function returnError(): string | null {
  if (typeof window === 'undefined') return null;
  const fromSearch = new URLSearchParams(window.location.search).get('error_description');
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('error_description');
  return fromSearch || fromHash || null;
}

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [names, setNames] = useState<CatalogueNames>(EMPTY_NAMES);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(() => returnError());
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    let live = true;
    // supabase-js notifies from inside a lock: never await another Supabase call in this callback.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!live) return;
      userRef.current = session?.user ?? null;
      setUser(session?.user ?? null);
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') setAuthReady(true);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setBuilds([]);
        setNames(EMPTY_NAMES);
        setLoadingData(false);
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') tidyReturnUrl();
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const userId = user?.id ?? null;

  const loadBuilds = useCallback(async (id: string) => {
    const list = await listBuilds(supabase, id);
    setBuilds(list);
    setNames(await loadCatalogueNames(supabase, list));
  }, []);

  // Load the profile and the garage whenever a different customer is signed in.
  useEffect(() => {
    const current = userRef.current;
    if (!userId || !current) return;
    let live = true;
    setLoadingData(true);
    setError(null);
    Promise.all([fetchProfile(supabase, current), loadBuilds(userId)])
      .then(([p]) => live && setProfile(p))
      .catch((err) => live && setError(err instanceof Error ? err.message : 'Your account could not be loaded.'))
      .finally(() => live && setLoadingData(false));
    return () => {
      live = false;
    };
  }, [userId, loadBuilds]);

  const signInWithGoogle = useCallback(async (returnTo = '/account') => {
    setError(null);
    const path = returnTo.startsWith('/') ? returnTo : `/${returnTo}`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + path, queryParams: { prompt: 'select_account' } },
    });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    const { error: outError } = await supabase.auth.signOut({ scope: 'local' });
    if (outError) setError(outError.message);
  }, []);

  const saveProfile = useCallback(async (patch: ProfilePatch) => {
    const current = userRef.current;
    if (!current) throw new Error('Sign in to save your profile.');
    setProfile(await saveProfileCall(supabase, current, patch));
  }, []);

  const renameBuild = useCallback(async (code: string, name: string) => {
    await renameBuildCall(supabase, code, name);
    setBuilds((bs) => bs.map((b) => (b.code === code ? { ...b, name: name.trim().slice(0, 80) || null } : b)));
  }, []);

  const deleteBuild = useCallback(async (code: string) => {
    await deleteBuildCall(supabase, code);
    setBuilds((bs) => bs.filter((b) => b.code !== code));
  }, []);

  const exportMyData = useCallback(() => exportMyDataCall(supabase), []);

  const deleteMyAccount = useCallback(async () => {
    await deleteMyAccountCall(supabase);
    // The login no longer exists; drop the local session (the server refuses it from now on).
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    setProfile(null);
    setBuilds([]);
    setUser(null);
  }, []);

  const reloadBuilds = useCallback(async () => {
    if (userRef.current) await loadBuilds(userRef.current.id);
  }, [loadBuilds]);

  const value = useMemo<AccountContextValue>(
    () => ({ user, authReady, profile, builds, names, loadingData, error, signInWithGoogle, signOutUser, saveProfile, renameBuild, deleteBuild, exportMyData, deleteMyAccount, reloadBuilds }),
    [user, authReady, profile, builds, names, loadingData, error, signInWithGoogle, signOutUser, saveProfile, renameBuild, deleteBuild, exportMyData, deleteMyAccount, reloadBuilds],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>');
  return ctx;
}
