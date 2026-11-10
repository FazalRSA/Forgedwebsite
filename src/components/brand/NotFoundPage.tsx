import React from 'react';
import { BrandHeader } from './BrandHeader';
import { Link } from '../../utils/router';

/** Shown for any address that is not a page on this site. The route is marked noindex in seo.ts. */
export const NotFoundPage: React.FC = () => (
  <>
    <BrandHeader />
    <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-24 text-center">
      <p className="text-xs font-mono font-semibold tracking-[0.2em] text-[#FF5500] uppercase">
        Page not found
      </p>
      <h1 className="mt-4 text-3xl sm:text-5xl font-light tracking-[-0.03em] text-white">
        That page does not exist.
      </h1>
      <p className="mt-4 text-neutral-400">
        The address may have changed, or the wheel may no longer be listed.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/#catalogue"
          className="px-6 py-3 rounded-full bg-[#FF5500] text-white text-xs font-mono font-semibold tracking-[0.12em] uppercase"
        >
          Wheel catalogue
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-full border border-[#2E2E38] text-white text-xs font-mono font-semibold tracking-[0.12em] uppercase"
        >
          Home
        </Link>
      </div>
    </main>
  </>
);
