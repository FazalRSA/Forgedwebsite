import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [hash, setHash] = useState<string>(() => window.location.hash || '');

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
      setHash(window.location.hash || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [rawPath, rawHash] = to.split('#');
    const targetPath = rawPath || '/';
    const targetHash = rawHash ? `#${rawHash}` : '';

    window.history.pushState({}, '', `${targetPath}${targetHash}`);
    setPathname(targetPath);
    setHash(targetHash);

    if (targetHash) {
      setTimeout(() => {
        const el = document.getElementById(rawHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
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
