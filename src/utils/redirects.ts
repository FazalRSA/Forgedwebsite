/**
 * Old addresses that no longer have a page of their own, and where they go now.
 *
 * The site was cut down to five pages (home, a wheel, installs, the Sixnine dealer page, contact). People still hold links
 * and bookmarks to the old store, dealer, garage and fitments pages, so those are sent on rather
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

  // The gold wheel was listed as the FSA002 by mistake; it is the FSA003, so its page moved.
  if (path === '/wheels/fsa002-gold') return '/wheels/fsa003-gold';

  // Past installations moved from /client-fitments to /installs.
  if (path === '/client-fitments' || path === '/store/client-fitments') return '/installs';

  // Dealer sign-up is gone; contact is the way in now.
  if (isWithin(path, '/dealer-application') || path === '/store/dealer-application') {
    return '/contact';
  }

  // The garage lives on the account page now (the account is shared with the configurator).
  if (isWithin(path, '/garage')) return '/account';

  // The Sixnine dealer page has one address; its old longer address goes there.
  if (isWithin(path, '/official-dealer-sixnine-wheels')) return '/sixnine-wheels';

  // The store, its collections and products: the in-stock wheels on the home page.
  if (
    isWithin(path, '/store') ||
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
