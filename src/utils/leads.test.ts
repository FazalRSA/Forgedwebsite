import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE, tradeContactEmail } from '../config/site';
import {
  buildLeadPayload,
  localReference,
  resolveLeadsWebhookUrl,
  submitLead,
  undeliveredMessage,
} from './leads';

type FetchCall = { url: string; init: RequestInit | undefined };

function fakeFetch(
  reply: { status: number; body: unknown } | Error,
  calls: FetchCall[] = []
): typeof fetch {
  const impl = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    if (reply instanceof Error) throw reply;
    return {
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      json: async () => reply.body,
    } as unknown as Response;
  };
  return impl as unknown as typeof fetch;
}

test('resolveLeadsWebhookUrl prefers VITE_LEADS_WEBHOOK_URL and falls back to the site config', () => {
  assert.equal(resolveLeadsWebhookUrl({ VITE_LEADS_WEBHOOK_URL: ' https://example.test/hook ' }), 'https://example.test/hook');
  assert.equal(resolveLeadsWebhookUrl({ VITE_LEADS_WEBHOOK_URL: '' }), SITE.leadsWebhookUrl);
  assert.equal(resolveLeadsWebhookUrl({}), SITE.leadsWebhookUrl);
  assert.equal(resolveLeadsWebhookUrl(undefined), SITE.leadsWebhookUrl);
  assert.match(SITE.leadsWebhookUrl, /^https:\/\/.+\/webhook\/forged-website-lead$/);
});

test('localReference matches the reference format n8n issues', () => {
  assert.equal(localReference('interest', 1700000123456), 'FORGED-INT-123456');
  assert.equal(localReference('dealer', 1700000123456), 'FORGED-DLR-123456');
  assert.equal(localReference('newsletter', 1700000123456), 'FORGED-NEWS-123456');
  assert.match(localReference('interest'), /^FORGED-INT-\d{6}$/);
});

test('buildLeadPayload stamps page, time, consent and source onto the input', () => {
  const now = new Date('2026-11-10T10:00:00.000Z');
  const payload = buildLeadPayload({ type: 'newsletter', email: 'a@b.co' }, '/store', now);
  assert.deepEqual(payload, {
    type: 'newsletter',
    email: 'a@b.co',
    page: '/store',
    submittedAt: '2026-11-10T10:00:00.000Z',
    consent: true,
    source: SITE.domain,
  });
});

test('submitLead posts JSON to the webhook and returns the reference n8n issued', async () => {
  const calls: FetchCall[] = [];
  const result = await submitLead(
    { type: 'interest', name: 'Ada', email: 'ada@example.com', phone: '+27 82 000 0000', subject: 'FSA002 Gold' },
    { fetchImpl: fakeFetch({ status: 200, body: { ok: true, reference: 'FORGED-INT-654321' } }, calls), url: 'https://hook.test/lead', page: '/wheels/fsa002-gold', now: new Date('2026-11-10T10:00:00.000Z') }
  );
  assert.deepEqual(result, { delivered: true, reference: 'FORGED-INT-654321', message: null });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://hook.test/lead');
  assert.equal(calls[0].init?.method, 'POST');
  const sent = JSON.parse(String(calls[0].init?.body));
  assert.equal(sent.type, 'interest');
  assert.equal(sent.email, 'ada@example.com');
  assert.equal(sent.page, '/wheels/fsa002-gold');
  assert.equal(sent.consent, true);
  assert.equal(sent.submittedAt, '2026-11-10T10:00:00.000Z');
});

test('submitLead falls back to a local reference and a visitor notice when delivery fails', async () => {
  const now = new Date(1700000123456);
  const network = await submitLead(
    { type: 'dealer', name: 'B', email: 'b@example.com', company: 'B Ltd' },
    { fetchImpl: fakeFetch(new Error('offline')), url: 'https://hook.test/lead', page: '/', now }
  );
  assert.equal(network.delivered, false);
  assert.equal(network.reference, 'FORGED-DLR-123456');
  assert.equal(network.message, undeliveredMessage('FORGED-DLR-123456'));
  assert.ok(network.message?.includes(tradeContactEmail()));

  const rejected = await submitLead(
    { type: 'interest', name: 'C', email: 'c@example.com' },
    { fetchImpl: fakeFetch({ status: 400, body: { ok: false, error: 'bad' } }), url: 'https://hook.test/lead', page: '/', now }
  );
  assert.equal(rejected.delivered, false);
  assert.equal(rejected.reference, 'FORGED-INT-123456');

  const malformed = await submitLead(
    { type: 'interest', name: 'D', email: 'd@example.com' },
    { fetchImpl: fakeFetch({ status: 200, body: { ok: true, reference: '   ' } }), url: 'https://hook.test/lead', page: '/', now }
  );
  assert.equal(malformed.delivered, true);
  assert.equal(malformed.reference, 'FORGED-INT-123456');
});

test('submitLead never sends a submission whose honeypot is filled', async () => {
  const calls: FetchCall[] = [];
  const result = await submitLead(
    { type: 'newsletter', email: 'spam@example.com', website: 'http://spam.example' },
    { fetchImpl: fakeFetch({ status: 200, body: { ok: true } }, calls), url: 'https://hook.test/lead', page: '/' }
  );
  assert.equal(calls.length, 0);
  assert.equal(result.delivered, true);
  assert.equal(result.message, null);
});

test('submitLead reports undelivered when no fetch implementation or URL is available', async () => {
  const result = await submitLead(
    { type: 'interest', name: 'E', email: 'e@example.com' },
    { fetchImpl: undefined as unknown as typeof fetch, url: '', page: '/' }
  );
  assert.equal(result.delivered, false);
  assert.match(result.reference, /^FORGED-INT-\d{6}$/);
});
