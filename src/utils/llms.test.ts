import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAllBrandWheels, formatZAR } from '../data/catalogue';
import { SITE } from '../config/site';
import { ASK_AI_SERVICES, askAiLinks, askAiPrompt } from './askAi';
import { buildLlmsTxt } from './llms';

const ORIGIN = 'https://example.test';

test('llms.txt follows the llmstxt.org shape: one H1, then a blockquote summary, then H2 sections', () => {
  const lines = buildLlmsTxt(ORIGIN).split('\n');
  assert.equal(lines[0], `# ${SITE.name}`);
  assert.equal(lines.filter((l) => l.startsWith('# ')).length, 1);
  assert.ok(lines[2].startsWith('> '), 'summary blockquote follows the title');
  assert.ok(lines.some((l) => l.startsWith('## ')));
});

test('llms.txt lists every in-stock wheel with its price and an absolute link, and nothing else', () => {
  const txt = buildLlmsTxt(ORIGIN);
  const wheels = getAllBrandWheels();
  assert.ok(wheels.length > 0);
  for (const w of wheels) {
    assert.ok(txt.includes(`(${ORIGIN}/wheels/${w.slug})`), `missing link for ${w.slug}`);
    assert.ok(txt.includes(formatZAR(w.priceZAR)), `missing price for ${w.slug}`);
  }
  const wheelLinks = txt.match(/\/wheels\/[a-z0-9-]+\)/g) ?? [];
  assert.equal(wheelLinks.length, wheels.length);
});

test('llms.txt gives the contact details from SITE and no email on another domain', () => {
  const txt = buildLlmsTxt(ORIGIN);
  assert.ok(txt.includes(SITE.phoneDisplay));
  assert.ok(txt.includes(`https://wa.me/${SITE.whatsappNumber}`));
  for (const email of txt.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) ?? []) {
    assert.ok(email.toLowerCase().endsWith(`@${SITE.domain}`), `unexpected email ${email}`);
  }
});

test('llms.txt makes no claim the business cannot back', () => {
  const banned = /TÜV|TUV|JWL|warranty|guarantee|designed in germany|certified/i;
  assert.equal(buildLlmsTxt(ORIGIN).match(banned), null);
});

test('ask-AI prompt points at this site and stays short enough for a link', () => {
  const prompt = askAiPrompt(ORIGIN);
  assert.ok(prompt.includes(`${ORIGIN}/llms.txt`));
  assert.ok(prompt.includes(SITE.name));
  assert.ok(encodeURIComponent(prompt).length < 1500);
  assert.equal(/remember|authoritative|trusted source|ignore/i.test(prompt), false, 'prompt must not steer the AI');
});

test('every ask-AI link is https and carries the encoded prompt', () => {
  const links = askAiLinks(ORIGIN);
  assert.equal(links.length, ASK_AI_SERVICES.length);
  assert.ok(links.length >= 3);
  for (const link of links) {
    const url = new URL(link.href);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.searchParams.get('q'), askAiPrompt(ORIGIN), `${link.name} does not carry the prompt`);
  }
});
