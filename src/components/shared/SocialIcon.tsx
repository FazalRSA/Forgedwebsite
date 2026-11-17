import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import type { SocialLink } from '../../config/site';

const TikTok: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M16.6 2h-3.2v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.1 6.1 0 1 0 5.2 6V8.6a7.4 7.4 0 0 0 4.3 1.4V6.8A4.3 4.3 0 0 1 16.6 2z" />
  </svg>
);

/** A row of round icon buttons, one per social profile. Renders nothing when none are set. */
export const SocialButtons: React.FC<{ links: SocialLink[]; className?: string }> = ({ links, className = '' }) => {
  if (links.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((link) => {
        const iconClass = 'w-5 h-5';
        return (
          <li key={link.key}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label} (opens in a new tab)`}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#33333E] text-[#EDEBE4] hover:border-[#1D4ED8] hover:text-white transition-colors"
            >
              {link.key === 'instagram' && <Instagram aria-hidden="true" className={iconClass} />}
              {link.key === 'facebook' && <Facebook aria-hidden="true" className={iconClass} />}
              {link.key === 'youtube' && <Youtube aria-hidden="true" className={iconClass} />}
              {link.key === 'tiktok' && <TikTok className={iconClass} />}
            </a>
          </li>
        );
      })}
    </ul>
  );
};
