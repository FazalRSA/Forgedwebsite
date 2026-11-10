/**
 * Old addresses that no longer have a page of their own, and where they go now.
 *
 * The site was cut down to four pages (home, a wheel, installs, contact). People still hold links
 * and bookmarks to the old store, dealer, account and fitments pages, so those are sent on rather
 * than shown a "not found" page. The router applies this with history.replaceState, so the old
 * address is replaced in the history and the Back button is not trapped.
 */

/** A path without its query string, hash or trailing slashes ("/" stays "/"). */
export function normalizePath(rawPath: string): string {
  return (rawPath.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
}

/** True when `path` is `base` or sits under it ("/store" and "/store/x", but not "/storefront"). */
function isWithin(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}/`);
}

/**
 * Where an old address now lives, or null when the path is not an old address.
 * The result is a full target (path plus optional hash) that can be given to history.replaceState.
 */
export function redirectFor(pathname: string): string | null {
  const path = normalizePath(pathname).toLowerCase();

  // Past installations moved from /client-fitments to /installs.
  if (path === '/client-fitments' || path === '/store/client-fitments') return '/installs';

  // Account, garage and dealer sign-up are gone; contact is the way in now.
  if (
    isWithin(path, '/account') ||
    isWithin(path, '/garage') ||
    isWithin(path, '/dealer-application') ||
    path === '/store/dealer-application'
  ) {
    return '/contact';
  }

  // The store, its collections and products, and the Sixnine dealer page: the in-stock wheels on the home page.
  if (
    isWithin(path, '/store') ||
    isWithin(path, '/sixnine-wheels') ||
    isWithin(path, '/official-dealer-sixnine-wheels') ||
    path === '/wheels'
  ) {
    return '/#catalogue';
  }

  return null;
}

/**
 * If the address bar holds an old address, replace it in place with its new address and say so.
 * history.replaceState swaps the current history entry instead of adding one, so the Back button
 * does not return to the old address and bounce forward again.
 */
export function applyRedirect(
  location: { pathname: string },
  history: { replaceState: (state: unknown, unused: string, url: string) => void }
): boolean {
  const target = redirectFor(location.pathname);
  if (!target) return false;
  history.replaceState({}, '', target);
  return true;
}
