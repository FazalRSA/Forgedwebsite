import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** When given, the failure message offers Close 3D as well as a reload. */
  onClose?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Catches a failed dynamic import() of the lazy-loaded WheelStudio chunk
 * (after lazyWithRetry's own retries are exhausted) so the page degrades to a
 * message instead of crashing. React.lazy caches a rejected import for the
 * lifetime of that lazy() instance, so "retry" is a full reload rather than
 * a state reset: resetting local state would just re-throw the same
 * cached rejection. (A failed GLB download is a different case: the studio
 * handles it itself and offers "Try again" without a reload.)
 */
export class Wheel3DSceneErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('WheelStudio failed to load:', error);
  }

  render() {
    if (this.state.hasError) {
      const { className = 'h-[76vh] min-h-[540px] max-h-[860px]', onClose } = this.props;
      return (
        <div
          role="alert"
          className={`relative w-full overflow-hidden rounded-2xl border border-[#26262E] bg-[#121215] flex items-center justify-center ${className}`}
        >
          <div className="flex flex-col items-center gap-3 text-neutral-300 text-center px-6">
            <AlertTriangle className="w-6 h-6 text-[#F43F5E]" />
            <p className="text-sm">The 3D view could not load. Check your connection and try again.</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#1D4ED8] px-5 text-sm font-semibold text-white cursor-pointer hover:bg-[#2563EB]"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Reload page</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#33333E] px-5 text-sm font-semibold text-white cursor-pointer hover:border-[#1D4ED8]"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>Close 3D</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
