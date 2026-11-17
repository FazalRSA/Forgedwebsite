import React from 'react';
import { Link } from '../../utils/router';

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export const BODY_LINK_CLASS =
  'text-white underline decoration-[#1D4ED8] decoration-2 underline-offset-4 hover:decoration-white transition-colors';

/**
 * Renders the small inline markup used in blog text: [link text](/path) and **bold**.
 * A path starting with "/" is an in-app link (still a real <a href>, so crawlers follow it);
 * anything else opens in a new tab.
 */
export const Inline: React.FC<{ text: string }> = ({ text }) => {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const [, label, target, bold] = match;
    if (label && target) {
      nodes.push(
        target.startsWith('/') ? (
          <Link key={index} to={target} className={BODY_LINK_CLASS}>
            {label}
          </Link>
        ) : (
          <a key={index} href={target} target="_blank" rel="noopener noreferrer" className={BODY_LINK_CLASS}>
            {label}
          </a>
        )
      );
    } else if (bold) {
      nodes.push(
        <strong key={index} className="font-semibold text-white">
          {bold}
        </strong>
      );
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
};
