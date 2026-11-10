import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { applyRedirect, redirectFor } from './redirects';

interface RouterContextValue {
  pathname: string;
  hash: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: '/',
  hash: '',
  navigate: () => {},
});

/** Scroll to an element id once it is on the page; the target may render a moment after the route. */
function scrollToHash(id: string, behavior: ScrollBehavior = 'smooth'): void {
  let attempts = 0;
  const tryScroll = () => {
    const el = document.getElementById(id);
    if (el) {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : behavior, block: 'start' });
    } else if (attempts++ < 10) {
      setTimeout(tryScroll, 100);
    }
  };
  setTimeout(tryScroll, 60);
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(() => {
    // An old address (see redirects.ts) is replaced in the history before the first render.
    applyRedirect(window.location, window.history);
    return window.location.pathname || '/';
  });
  const [hash, setHash] = useState<string>(() => window.location.hash || '');

  // A link such as /#catalogue (including one reached through a redirect) opens at its section.
  useEffect(() => {
    const initialHash = window.location.hash.replace(/^#/, '');
    if (initialHash) scrollToHash(initialHash, 'auto');
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      applyRedirect(window.location, window.history);
      setPathname(window.location.pathname || '/');
      setHash(window.location.hash || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [requestedPath, requestedHash] = to.split('#');
    // A link to an old address goes straight to its new address; the old one is never added to the history.
    const redirected = redirectFor(requestedPath || '/');
    const [rawPath, rawHash] = redirected ? redirected.split('#') : [requestedPath, requestedHash];
    const targetPath = rawPath || '/';
    const targetHash = rawHash ? `#${rawHash}` : '';

    window.history.pushState({}, '', `${targetPath}${targetHash}`);
    setPathname(targetPath);
    setHash(targetHash);

    if (targetHash) {
      scrollToHash(rawHash);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, hash, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

/**
 * An in-app link that is still a real <a href>, so search engines can follow it and visitors can
 * open it in a new tab. A plain left click is routed in-app without a page reload.
 */
export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      {...rest}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
