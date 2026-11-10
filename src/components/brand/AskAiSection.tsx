import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { askAiLinks } from '../../utils/askAi';
import { CTA_SECONDARY_CLASS } from './ContactCta';
import { SITE_ORIGIN } from '../../utils/seo';

/**
 * "Ask AI about us". Each button opens that AI assistant in a new tab with a question about the
 * business typed in (see src/utils/askAi.ts). The question points at this site's /llms.txt.
 */
export const AskAiSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Use the address the visitor is on, so the question works on any domain the site is served from.
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN;
  const links = askAiLinks(origin);

  return (
    <section
      id="ask-ai"
      data-testid="ask-ai-section"
      aria-labelledby="ask-ai-heading"
      className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E] ${className}`}
    >
      <h2 id="ask-ai-heading" className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white">
        Ask AI about us
      </h2>
      <p className="mt-4 max-w-xl text-neutral-300">
        Open your AI assistant with a question about our wheels in stock already typed in.
      </p>
      <ul className="mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ask ${link.name} about us (opens in a new tab)`}
              className={`${CTA_SECONDARY_CLASS} w-full gap-2`}
            >
              <span>{link.name}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-xl text-sm text-neutral-400">
        The answer comes from the AI, not from us. Check price and stock with us before you decide.
      </p>
    </section>
  );
};
