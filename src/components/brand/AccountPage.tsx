import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Download, FolderOpen, Loader2, Lock, LogOut, Pencil, Trash2, UserRound } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { CTA_SECONDARY_CLASS } from './ContactCta';
import { AccountProvider, useAccount } from '../../context/AccountContext';
import { BRAKE_SYSTEMS, BuildMissingError, describeBuild, exportFilename } from '../../utils/accountService';
import { Link } from '../../utils/router';
import { SITE, configuratorBuildLink } from '../../config/site';

const INPUT_CLASS =
  'w-full min-h-12 px-4 bg-[#141418] border border-[#26262E] text-[#EDEBE4] text-base rounded-xl focus:outline-none focus:border-[#F43F5E] transition-colors placeholder:text-neutral-500';
const LABEL_CLASS = 'block text-sm text-[#C2C2CC] mb-1.5';
const PANEL_CLASS = 'bg-[#121215] border border-[#26262E] rounded-2xl p-5 sm:p-7';
const LINK_CLASS = 'text-white underline underline-offset-4 hover:text-[#F43F5E]';
const GHOST_CLASS =
  'inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full text-sm text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer';

/** Google's standard-colour "G" on white, as its sign-in branding guidelines require. */
const GoogleMark: React.FC = () => (
  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  </span>
);

/** "Continue with Google" to Google's dark-theme branding: #131314 fill, 1px #8E918F stroke, #E3E3E3 text, the standard G. */
const GoogleButton: React.FC<{ busy: boolean; onClick: () => void }> = ({ busy, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    aria-busy={busy}
    className="press relative flex min-h-12 w-full items-center rounded-full bg-[#131314] px-3 text-[#E3E3E3] ring-1 ring-inset ring-[#8E918F] transition-colors hover:bg-[#1f1f21] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F43F5E] disabled:cursor-progress sm:max-w-sm"
    style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif", fontWeight: 500, fontSize: 14, lineHeight: '20px' }}
  >
    <GoogleMark />
    <span className="ml-2.5 flex-1 pr-[34px] text-center">Continue with Google</span>
    {busy && <Loader2 className="absolute right-4 h-4 w-4 animate-spin" aria-hidden="true" />}
  </button>
);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SameAccountNote: React.FC = () => (
  <p className="text-sm text-neutral-400 leading-relaxed">
    This is the same account as the{' '}
    {SITE.configuratorUrl ? (
      <a href={SITE.configuratorUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        FORGEDSA wheel configurator
      </a>
    ) : (
      'FORGEDSA wheel configurator'
    )}
    : sign in with the same Google account on either site and you find the same profile and saved builds.
  </p>
);

/** Shown while Supabase decides whether someone is signed in (and while a Google return completes). */
const Checking: React.FC = () => (
  <div role="status" aria-label="Checking your sign-in" className="flex items-center gap-3 text-sm text-neutral-400 py-10">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    <span>Checking your sign-in…</span>
  </div>
);

const SignedOut: React.FC<{ deleted: boolean }> = ({ deleted }) => {
  const { signInWithGoogle, error } = useAccount();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Back from Google through the browser's back button: the page can come back with its old state.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setBusy(false);
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const start = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      await signInWithGoogle('/account');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Google sign-in could not be started. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className={`${PANEL_CLASS} space-y-6`}>
      {deleted && (
        <p role="status" className="rounded-xl border border-[#26262E] bg-[#18181D] px-4 py-3 text-sm text-neutral-200">
          Your account has been deleted. Your saved builds and profile are gone.
        </p>
      )}
      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-white">Keep your builds in one place</h2>
        <p className="text-neutral-300 leading-relaxed">
          Sign in to keep the wheel builds you save and to fill in our enquiry forms faster. It is one account for this website and the wheel configurator.
        </p>
      </div>
      <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5 marker:text-[#F43F5E]">
        <li>Builds you save in the configurator are listed here, ready to open again.</li>
        <li>Your name and phone number are saved once, if you choose to add them.</li>
        <li>You can download or delete everything we hold about you from this page.</li>
      </ul>
      <div className="space-y-3">
        <GoogleButton busy={busy} onClick={start} />
        {(localError || error) && (
          <p role="alert" className="text-sm text-[#F43F5E]">
            {localError || error}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" /> Google signs you in. We never see your Google password.
        </p>
      </div>
      <p className="text-xs leading-relaxed text-neutral-400">
        If you sign in we store your name, email address and Google profile picture to run your account. Details are in the{' '}
        <Link to="/privacy-policy" className={LINK_CLASS}>
          privacy notice
        </Link>
        . You can use this website without an account.
      </p>
    </div>
  );
};

const ProfilePanel: React.FC = () => {
  const { profile, user, saveProfile } = useAccount();
  const [form, setForm] = useState({ displayName: '', phone: '', city: '', brakeSystem: '' });
  const touched = useRef(new Set<string>());
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // The fields follow the stored profile, except those being typed in.
  useEffect(() => {
    setForm((f) => {
      const fresh = {
        displayName: profile?.displayName ?? (user?.user_metadata?.full_name as string | undefined) ?? '',
        phone: profile?.phone ?? '',
        city: profile?.city ?? '',
        brakeSystem: profile?.brakeSystem ?? '',
      };
      touched.current.forEach((k) => {
        (fresh as Record<string, string>)[k] = (f as Record<string, string>)[k];
      });
      return fresh;
    });
  }, [profile, user?.user_metadata?.full_name]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    touched.current.add(k);
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setState('idle');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('saving');
    setMessage(null);
    try {
      await saveProfile({ displayName: form.displayName, phone: form.phone, city: form.city, brakeSystem: form.brakeSystem as never });
      touched.current.clear();
      setState('saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Your details could not be saved.');
      setState('error');
    }
  };

  return (
    <form onSubmit={submit} className={`${PANEL_CLASS} space-y-4`} aria-labelledby="acc-profile">
      <h2 id="acc-profile" className="text-xl font-medium text-white">
        Your details
      </h2>
      <p className="text-sm text-neutral-400">All optional. They save you typing the same things into our forms.</p>
      <div>
        <label htmlFor="acc-name" className={LABEL_CLASS}>
          Name
        </label>
        <input id="acc-name" value={form.displayName} onChange={set('displayName')} autoComplete="name" maxLength={100} className={INPUT_CLASS} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="acc-phone" className={LABEL_CLASS}>
            Phone or WhatsApp number
          </label>
          <input id="acc-phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="082 000 0000" maxLength={40} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="acc-city" className={LABEL_CLASS}>
            City
          </label>
          <input id="acc-city" value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={120} className={INPUT_CLASS} />
        </div>
      </div>
      <div>
        <label htmlFor="acc-brakes" className={LABEL_CLASS}>
          Brake system on your car
        </label>
        <select id="acc-brakes" value={form.brakeSystem} onChange={set('brakeSystem')} className={INPUT_CLASS}>
          <option value="">Not set</option>
          {BRAKE_SYSTEMS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      {message && (
        <p role="alert" className="text-sm text-[#F43F5E]">
          {message}
        </p>
      )}
      <button type="submit" disabled={state === 'saving'} className={`${CTA_SECONDARY_CLASS} w-full sm:w-auto disabled:opacity-60`}>
        {state === 'saved' ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save details'}
      </button>
      <p role="status" className="sr-only">
        {state === 'saved' ? 'Your details were saved' : ''}
      </p>
    </form>
  );
};

/** The email choice sits apart from the profile: service emails are not optional, news and offers are. */
const EmailPanel: React.FC = () => {
  const { profile, saveProfile } = useAccount();
  const [checked, setChecked] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setChecked(profile?.marketingOptIn ?? false);
  }, [profile?.marketingOptIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('saving');
    setMessage(null);
    try {
      await saveProfile({ marketingOptIn: checked });
      setState('saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Your choice could not be saved.');
      setState('error');
    }
  };

  return (
    <form onSubmit={submit} className={`${PANEL_CLASS} space-y-4`} aria-labelledby="acc-email">
      <h2 id="acc-email" className="text-xl font-medium text-white">
        Emails from us
      </h2>
      <p className="text-sm leading-relaxed text-neutral-300">
        <strong className="font-semibold text-[#EDEBE4]">Service emails</strong> come with your account and your enquiries: a welcome when you sign up and a confirmation
        when you send an enquiry. They are sent from {SITE.supportEmail || 'us'} and you cannot switch them off while you have an account.
      </p>
      <label htmlFor="acc-marketing" className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#26262E] bg-[#141418] p-4">
        <input
          id="acc-marketing"
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            setState('idle');
          }}
          className="mt-1 h-5 w-5 shrink-0 accent-[#1D4ED8]"
        />
        <span className="text-sm leading-relaxed text-neutral-200">
          <strong className="block font-semibold text-white">Email me news and offers</strong>
          New wheels in stock and special offers. Off unless you tick it. You can change your mind here at any time.
          {profile?.marketingOptInAt ? <span className="mt-1 block text-xs text-neutral-400">Last changed {formatDate(profile.marketingOptInAt)}.</span> : null}
        </span>
      </label>
      {message && (
        <p role="alert" className="text-sm text-[#F43F5E]">
          {message}
        </p>
      )}
      <button type="submit" disabled={state === 'saving' || checked === (profile?.marketingOptIn ?? false)} className={`${CTA_SECONDARY_CLASS} w-full sm:w-auto disabled:opacity-50 disabled:cursor-default`}>
        {state === 'saved' ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : 'Save email choice'}
      </button>
      <p role="status" className="sr-only">
        {state === 'saved' ? 'Your email choice was saved' : ''}
      </p>
    </form>
  );
};

const BuildsPanel: React.FC = () => {
  const { builds, names, loadingData, renameBuild, deleteBuild, reloadBuilds } = useAccount();
  const [renaming, setRenaming] = useState<{ code: string; name: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ code: string | null; message: string } | null>(null);

  const run = async (code: string, action: () => Promise<void>, after?: () => void) => {
    setBusy(code);
    setProblem(null);
    try {
      await action();
      after?.();
    } catch (err) {
      if (err instanceof BuildMissingError) {
        setProblem({ code: null, message: err.message });
        await reloadBuilds().catch(() => undefined);
      } else {
        setProblem({ code, message: err instanceof Error ? err.message : 'That did not work. Please try again.' });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={`${PANEL_CLASS} space-y-4`} aria-labelledby="acc-builds">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="acc-builds" className="text-xl font-medium text-white">
          Your builds
        </h2>
        {builds.length > 0 && <span className="text-xs text-neutral-400">{builds.length} saved</span>}
      </div>
      {problem?.code === null && (
        <p role="alert" className="text-sm text-[#F43F5E]">
          {problem.message}
        </p>
      )}
      {loadingData && builds.length === 0 ? (
        <p role="status" className="text-sm text-neutral-400">
          Loading your builds…
        </p>
      ) : builds.length === 0 ? (
        <p className="text-sm leading-relaxed text-neutral-400">
          Nothing saved yet. Build a set of wheels on a car in the{' '}
          {SITE.configuratorUrl ? (
            <a href={SITE.configuratorUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              configurator
            </a>
          ) : (
            'configurator'
          )}
          , sign in there with the same Google account and use “Save to garage”: it appears here.
        </p>
      ) : (
        <ul className="space-y-3">
          {builds.map((b) => {
            const label = b.name || b.code;
            const link = configuratorBuildLink(b.code);
            const isBusy = busy === b.code;
            return (
              <li key={b.code} className="rounded-xl border border-[#26262E] bg-[#141418] p-4">
                {renaming?.code === b.code ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void run(b.code, () => renameBuild(b.code, renaming.name), () => setRenaming(null));
                    }}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <label htmlFor={`rn-${b.code}`} className="sr-only">
                      Build name
                    </label>
                    <input
                      id={`rn-${b.code}`}
                      autoFocus
                      value={renaming.name}
                      maxLength={80}
                      onChange={(e) => setRenaming({ code: b.code, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)}
                      className={`${INPUT_CLASS} sm:flex-1`}
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={isBusy} className={`${CTA_SECONDARY_CLASS} flex-1 sm:flex-none`}>
                        {isBusy ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setRenaming(null)} className={GHOST_CLASS}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`truncate text-base font-semibold text-white ${b.name ? '' : 'font-tech-mono tracking-[0.12em]'}`}>{label}</p>
                      <p className="mt-0.5 text-sm text-neutral-300">{describeBuild(b, names)}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {formatDate(b.createdAt)}
                        {b.name ? <span className="font-tech-mono"> · {b.code}</span> : null}
                      </p>
                    </div>
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label} in the configurator`} className={`${CTA_SECONDARY_CLASS} !min-h-11 !px-4 shrink-0`}>
                        <FolderOpen className="h-4 w-4" aria-hidden="true" />
                        <span>Open</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                )}
                {problem?.code === b.code && (
                  <p role="alert" className="mt-2 text-sm text-[#F43F5E]">
                    {problem.message}
                  </p>
                )}
                {confirmDelete === b.code ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-neutral-300">Delete this build?</span>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void run(b.code, () => deleteBuild(b.code), () => setConfirmDelete(null))}
                      className="inline-flex min-h-11 items-center rounded-full border border-[#F43F5E]/50 px-4 text-sm font-semibold text-[#F43F5E] hover:bg-[#F43F5E]/10 cursor-pointer"
                    >
                      {isBusy ? 'Deleting…' : 'Delete'}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className={GHOST_CLASS}>
                      Keep
                    </button>
                  </div>
                ) : (
                  renaming?.code !== b.code && (
                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        aria-label={`Rename ${label}`}
                        onClick={() => {
                          setConfirmDelete(null);
                          setRenaming({ code: b.code, name: b.name ?? '' });
                        }}
                        className={GHOST_CLASS}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Rename
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${label}`}
                        onClick={() => {
                          setRenaming(null);
                          setConfirmDelete(b.code);
                        }}
                        className={`${GHOST_CLASS} hover:!text-[#F43F5E]`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                      </button>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const DataPanel: React.FC<{ onDeleted: () => void }> = ({ onDeleted }) => {
  const { exportMyData, deleteMyAccount } = useAccount();
  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const download = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Your data could not be downloaded.');
    } finally {
      setExporting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      await deleteMyAccount();
      onDeleted();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Your account could not be deleted.');
      setDeleting(false);
    }
  };

  return (
    <section className={`${PANEL_CLASS} space-y-4`} aria-labelledby="acc-data">
      <h2 id="acc-data" className="text-xl font-medium text-white">
        Your data
      </h2>
      <p className="text-sm leading-relaxed text-neutral-300">
        Download a copy of what we hold about you, or delete your account. These are your rights under POPIA; the{' '}
        <Link to="/privacy-policy" className={LINK_CLASS}>
          privacy notice
        </Link>{' '}
        has the rest.
      </p>
      <button type="button" onClick={() => void download()} disabled={exporting} className={`${CTA_SECONDARY_CLASS} w-full sm:w-auto disabled:opacity-60`}>
        <Download className="h-4 w-4" aria-hidden="true" />
        {exporting ? 'Preparing…' : 'Download my data'}
      </button>
      <div className="border-t border-[#26262E] pt-4">
        {confirming ? (
          <div role="alertdialog" aria-labelledby="acc-del-title" className="space-y-3 rounded-xl border border-[#F43F5E]/40 bg-[#F43F5E]/[0.06] p-4">
            <p id="acc-del-title" className="font-semibold text-white">
              Delete your account?
            </p>
            <p className="text-sm leading-relaxed text-neutral-200">
              This deletes your sign-in, your profile and every build saved to your garage, on this website and in the configurator. It cannot be undone.
              Enquiries and PDF requests you have already sent stay with us as sales records, no longer linked to an account
              {SITE.supportEmail ? (
                <>
                  ; to have those removed too, email{' '}
                  <a href={`mailto:${SITE.supportEmail}`} className={LINK_CLASS}>
                    {SITE.supportEmail}
                  </a>
                </>
              ) : null}
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void remove()}
                disabled={deleting}
                className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F43F5E] px-6 text-[15px] font-semibold text-[#111111] hover:bg-[#FB6F86] disabled:opacity-60 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button type="button" onClick={() => setConfirming(false)} disabled={deleting} className={CTA_SECONDARY_CLASS}>
                Keep my account
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-11 items-center gap-2 text-sm text-neutral-300 underline underline-offset-4 hover:text-[#F43F5E] cursor-pointer">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete my account
          </button>
        )}
        {message && (
          <p role="alert" className="mt-3 text-sm text-[#F43F5E]">
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

const SignedIn: React.FC<{ onDeleted: () => void }> = ({ onDeleted }) => {
  const { user, profile, signOutUser, error } = useAccount();
  const avatar = profile?.avatarUrl ?? (user?.user_metadata?.avatar_url as string | undefined) ?? (user?.user_metadata?.picture as string | undefined) ?? null;
  const name = profile?.displayName ?? (user?.user_metadata?.full_name as string | undefined) ?? '';
  const email = profile?.email ?? user?.email ?? '';

  return (
    <div className="space-y-6">
      <div className={`${PANEL_CLASS} flex items-center gap-4`}>
        {avatar ? (
          <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-[#26262E]" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-[#26262E]">
            <UserRound className="h-6 w-6 text-neutral-400" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-white">{name || email}</p>
          <p className="truncate text-sm text-neutral-400">{email}</p>
        </div>
        <button type="button" onClick={() => void signOutUser()} className={`${GHOST_CLASS} shrink-0`} aria-label="Sign out">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-[#F43F5E]">
          {error}
        </p>
      )}
      <SameAccountNote />
      <ProfilePanel />
      <BuildsPanel />
      <EmailPanel />
      <DataPanel onDeleted={onDeleted} />
    </div>
  );
};

const AccountBody: React.FC = () => {
  const { user, authReady } = useAccount();
  const [deleted, setDeleted] = useState(false);
  if (!authReady) return <Checking />;
  return user ? <SignedIn onDeleted={() => setDeleted(true)} /> : <SignedOut deleted={deleted} />;
};

/** /account: sign in, profile, saved builds, email choice and the customer's own data. Private: noindex, not in the sitemap. */
export const AccountPage: React.FC = () => (
  <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
    <BrandHeader />
    <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 space-y-6">
      <div>
        <p className="text-[11px] font-tech-mono font-semibold tracking-[0.18em] uppercase text-neutral-400">Account</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-light tracking-[-0.03em] leading-tight text-white">Your FORGED account</h1>
      </div>
      <AccountProvider>
        <AccountBody />
      </AccountProvider>
      <p className="text-xs text-neutral-500">
        Questions about your account? Message us on the{' '}
        <Link to="/contact" className={LINK_CLASS}>
          contact page
        </Link>
        .
      </p>
    </main>
  </div>
);
