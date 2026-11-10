import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches a failed dynamic import() of the lazy-loaded WheelStudio chunk
 * (after lazyWithRetry's own retries are exhausted) so the PDP degrades to a
 * message instead of crashing. React.lazy caches a rejected import for the
 * lifetime of that lazy() instance, so "retry" is a full reload rather than
 * a state reset — resetting local state would just re-throw the same
 * cached rejection.
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
      return (
        <div className="relative w-full h-[76vh] min-h-[540px] max-h-[860px] bg-[#0A0A0A] border border-[#26262E] rounded-3xl overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-neutral-400 text-center px-6">
            <AlertTriangle className="w-6 h-6 text-[#FF5500]" />
            <p className="text-xs font-mono uppercase tracking-[0.14em]">
              3D studio failed to load
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF5500] hover:text-[#FF6B1A] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload page</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
