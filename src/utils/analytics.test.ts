import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyticsScript, loadAnalytics, trackEvent } from './analytics';

const SET_UP = {
  analyticsScriptUrl: 'https://cloud.example.net/script.js',
  analyticsWebsiteId: '94db1cb1-74f4-4a40-ad6c-962362670409',
  host: 'www.example.co.za',
};
const NOT_SET_UP = { ...SET_UP, analyticsScriptUrl: '', analyticsWebsiteId: '' };

/** Just enough of a document to see what loadAnalytics adds to <head>. */
function fakeDocument() {
  const added: Array<{ src: string; defer: boolean; dataset: Record<string, string> }> = [];
  const doc = {
    head: { appendChild: (el: (typeof added)[number]) => added.push(el) },
    createElement: () => ({ src: '', defer: false, dataset: {} as Record<string, string> }),
    querySelector: () => added.find((el) => el.dataset.websiteId) ?? null,
  };
  return { doc: doc as unknown as Document, added };
}

test('statistics are off until both the tracker address and the website ID are set', () => {
  assert.equal(analyticsScript(NOT_SET_UP), null);
  assert.equal(analyticsScript({ ...SET_UP, analyticsWebsiteId: '' }), null);
  assert.equal(analyticsScript({ ...SET_UP, analyticsScriptUrl: '' }), null);
});

test('a valid configuration gives the tracker address, the website ID and only the production host', () => {
  assert.deepEqual(analyticsScript(SET_UP), {
    src: 'https://cloud.example.net/script.js',
    websiteId: '94db1cb1-74f4-4a40-ad6c-962362670409',
    domains: 'www.example.co.za',
  });
});

test('a tracker address that is not https, or a website ID that is not a UUID, is refused', () => {
  assert.equal(analyticsScript({ ...SET_UP, analyticsScriptUrl: 'http://cloud.example.net/script.js' }), null);
  assert.equal(analyticsScript({ ...SET_UP, analyticsScriptUrl: 'not a url' }), null);
  assert.equal(analyticsScript({ ...SET_UP, analyticsScriptUrl: 'javascript:alert(1)' }), null);
  assert.equal(analyticsScript({ ...SET_UP, analyticsWebsiteId: 'my-site' }), null);
  assert.equal(analyticsScript({ ...SET_UP, analyticsWebsiteId: '94db1cb1-74f4-4a40-ad6c-962362670409"><script>' }), null);
});

test('loadAnalytics adds nothing when statistics are not set up', () => {
  const { doc, added } = fakeDocument();
  assert.equal(loadAnalytics(doc, NOT_SET_UP), null);
  assert.equal(added.length, 0);
});

test('loadAnalytics adds one deferred script that counts only the production host and respects Do Not Track', () => {
  const { doc, added } = fakeDocument();
  const el = loadAnalytics(doc, SET_UP);
  assert.equal(added.length, 1);
  assert.equal(el, added[0]);
  assert.equal(added[0].src, 'https://cloud.example.net/script.js');
  assert.equal(added[0].defer, true);
  assert.equal(added[0].dataset.websiteId, '94db1cb1-74f4-4a40-ad6c-962362670409');
  assert.equal(added[0].dataset.domains, 'www.example.co.za');
  assert.equal(added[0].dataset.doNotTrack, 'true');
});

test('loadAnalytics is safe to call twice', () => {
  const { doc, added } = fakeDocument();
  loadAnalytics(doc, SET_UP);
  loadAnalytics(doc, SET_UP);
  assert.equal(added.length, 1);
});

test('trackEvent sends the name with the page address and the data given', () => {
  const calls: Array<[string, unknown]> = [];
  const win = {
    location: { pathname: '/wheels/fsa002-gold' },
    umami: { track: (name: string, data?: unknown) => calls.push([name, data]) },
  } as unknown as Window;
  trackEvent('enquiry_open', { channel: 'form' }, win);
  assert.deepEqual(calls, [['enquiry_open', { page: '/wheels/fsa002-gold', channel: 'form' }]]);
});

test('trackEvent does nothing when the tracker is not running, and never throws', () => {
  trackEvent('enquiry_open', {}, undefined);
  trackEvent('enquiry_open', {}, { location: { pathname: '/' } } as unknown as Window);
  const throwing = {
    location: { pathname: '/' },
    umami: {
      track: () => {
        throw new Error('blocked');
      },
    },
  } as unknown as Window;
  assert.doesNotThrow(() => trackEvent('enquiry_open', {}, throwing));
});
