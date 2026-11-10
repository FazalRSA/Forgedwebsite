import React from 'react';
import { BrandHeader } from './BrandHeader';
import { Link } from '../../utils/router';
import { CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';

/** Shown for any address that is not a page on this site. The route is marked noindex in seo.ts. */
export const NotFoundPage: React.FC = () => (
  <>
    <BrandHeader />
    <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-20 sm:py-28">
      <h1 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-white">
        That page does not exist.
      </h1>
      <p className="mt-4 text-neutral-300">
        The address may have changed, or the wheel may have been sold.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link to="/#catalogue" className={CTA_PRIMARY_CLASS}>
          Wheels
        </Link>
        <Link to="/installs" className={CTA_SECONDARY_CLASS}>
          Installs
        </Link>
        <Link to="/contact" className={CTA_SECONDARY_CLASS}>
          Contact
        </Link>
      </div>
    </main>
  </>
);
