/**
 * "Ask AI about us": links that open an AI assistant with a question about this business already
 * typed in. The question sends the assistant to /llms.txt, which is generated from the same stock
 * data as the site. Nothing is sent by this website; the visitor's own AI app does the asking.
 */
import { SITE } from '../config/site';

export interface AskAiService {
  name: string;
  /** Address the prompt is appended to as the `q` query parameter. */
  base: string;
}

/** Assistants that accept a prefilled question in the address. */
export const ASK_AI_SERVICES: readonly AskAiService[] = [
  { name: 'ChatGPT', base: 'https://chatgpt.com/' },
  { name: 'Claude', base: 'https://claude.ai/new' },
  { name: 'Perplexity', base: 'https://www.perplexity.ai/search/new' },
  { name: 'Google AI', base: 'https://www.google.com/search?udm=50' },
];

/** The question typed in for the visitor. It asks for facts only and does not steer the answer. */
export function askAiPrompt(origin: string): string {
  return (
    `Read ${origin}/llms.txt and tell me about ${SITE.name} in ${SITE.country}: ` +
    'which forged wheels for BMW M cars they have in stock, what each set costs, ' +
    'which cars they fit, and how to enquire.'
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
