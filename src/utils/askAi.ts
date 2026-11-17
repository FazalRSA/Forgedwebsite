/**
 * "Ask AI about us": links that open an AI assistant with a question about this business already
 * typed in. The question sends the assistant to /llms.txt, which is generated from the same stock
 * data as the site. Nothing is sent by this website; the visitor's own AI app does the asking.
 */
import { SITE } from '../config/site';

export interface AskAiService {
  name: string;
  /**
   * Address the prompt is appended to as the `q` query parameter. ChatGPT, Perplexity and Google AI
   * Mode run the question as soon as the page loads. Claude only fills its box (its documented
   * behaviour), so the visitor presses send there.
   */
  base: string;
}

/** Assistants that accept a prefilled question in the address. */
export const ASK_AI_SERVICES: readonly AskAiService[] = [
  { name: 'ChatGPT', base: 'https://chatgpt.com/' },
  { name: 'Claude', base: 'https://claude.ai/new' },
  { name: 'Perplexity', base: 'https://www.perplexity.ai/search' },
  { name: 'Google AI', base: 'https://www.google.com/search?udm=50' },
];

/**
 * The question typed in for the visitor. It sends the assistant to /llms.txt for the facts, asks for
 * a short answer in plain terms (stock, price per set of four, fit, how to enquire), and tells it to
 * say so rather than guess when it cannot open the page. It does not steer the answer.
 */
export function askAiPrompt(origin: string): string {
  return (
    `Open ${origin}/llms.txt and use only what it says to answer this about ${SITE.name} in ${SITE.country}. ` +
    'Which forged wheels for BMW M cars are in stock right now? ' +
    'For each set give the design, finish, sizes, which cars it fits and the price in South African Rand per set of four. ' +
    'Then say how to enquire. Keep it short and list the sets clearly. ' +
    'If you cannot open the page, say so instead of guessing, and tell me to check price and stock with the business.'
  );
}

export function askAiLinks(origin: string): { name: string; href: string }[] {
  const prompt = askAiPrompt(origin);
  return ASK_AI_SERVICES.map(({ name, base }) => {
    const url = new URL(base);
    url.searchParams.set('q', prompt);
    return { name, href: url.toString() };
  });
}
