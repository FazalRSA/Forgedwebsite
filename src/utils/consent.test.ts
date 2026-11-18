import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CONSENT_SETTINGS_EVENT,
  CONSENT_STORAGE_KEY,
  chooseConsent,
  clearAnalyticsCookies,
  openCookieSettings,
  readConsent,
  saveConsent,
  sendConsentUpdate,
} from './consent';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

/** A document whose cookie jar records every write, so deletions can be checked. */
function fakeDocument(cookies: string, hostname: string) {
  const writes: string[] = [];
  const doc = {
    location: { hostname },
    get cookie() {
      return cookies;
    },
    set cookie(value: string) {
      writes.push(value);
    },
  };
  return { doc: doc as unknown as Document, writes };
}

const isArguments = (value: unknown) => Object.prototype.toString.call(value) === '[object Arguments]';

test('readConsent returns the saved choice, and null when there is none, it is unknown, or storage is blocked', () => {
  assert.equal(readConsent({ localStorage: fakeStorage({ [CONSENT_STORAGE_KEY]: 'granted' }) } as unknown as Window), 'granted');
  assert.equal(readConsent({ localStorage: fakeStorage({ [CONSENT_STORAGE_KEY]: 'denied' }) } as unknown as Window), 'denied');
  assert.equal(readConsent({ localStorage: fakeStorage() } as unknown as Window), null);
  assert.equal(readConsent({ localStorage: fakeStorage({ [CONSENT_STORAGE_KEY]: 'yes please' }) } as unknown as Window), null);
  const blocked = {
    get localStorage(): Storage {
      throw new Error('SecurityError');
    },
  } as unknown as Window;
  assert.equal(readConsent(blocked), null);
  assert.equal(readConsent(undefined), null);
});

test('saveConsent stores the choice and never throws when storage is blocked', () => {
  const storage = fakeStorage();
  saveConsent('denied', { localStorage: storage } as unknown as Window);
  assert.equal(storage.data[CONSENT_STORAGE_KEY], 'denied');
  const full = { localStorage: { setItem: () => { throw new Error('QuotaExceededError'); } } } as unknown as Window;
  assert.doesNotThrow(() => saveConsent('granted', full));
});

test('sendConsentUpdate pushes a gtag-style Arguments object that changes analytics consent only', () => {
  const dataLayer: unknown[] = [];
  sendConsentUpdate('granted', { dataLayer } as unknown as Window);
  assert.equal(dataLayer.length, 1);
  assert.ok(isArguments(dataLayer[0]), 'Google Tag Manager ignores consent commands that are not Arguments objects');
  assert.deepEqual(Array.from(dataLayer[0] as ArrayLike<unknown>), ['consent', 'update', { analytics_storage: 'granted' }]);
});

test('sendConsentUpdate does nothing where Google Tag Manager is not running', () => {
  const win = {} as Window;
  sendConsentUpdate('granted', win);
  assert.equal(win.dataLayer, undefined, 'no data layer is created on a page without the container');
  assert.doesNotThrow(() => sendConsentUpdate('denied', undefined));
});

test('clearAnalyticsCookies expires only the _ga cookies, on the host and every parent domain', () => {
  const { doc, writes } = fakeDocument('_ga=GA1.1.123; _ga_H2TR6RVSK0=GS1.1.456; other=1; _gat=1; galaxy=2', 'www.forgedsa.co.za');
  assert.deepEqual(clearAnalyticsCookies(doc), ['_ga', '_ga_H2TR6RVSK0']);
  for (const name of ['_ga', '_ga_H2TR6RVSK0']) {
    for (const domain of ['', '; domain=.www.forgedsa.co.za', '; domain=.forgedsa.co.za', '; domain=.co.za']) {
      assert.ok(writes.includes(`${name}=; Max-Age=0; path=/${domain}`), `${name}${domain}`);
    }
  }
  assert.ok(!writes.some((w) => w.startsWith('other=') || w.startsWith('_gat=') || w.startsWith('galaxy=')));
});

test('clearAnalyticsCookies is safe with no cookies, no document, or a cookie jar that throws', () => {
  assert.deepEqual(clearAnalyticsCookies(fakeDocument('', 'localhost').doc), []);
  assert.deepEqual(clearAnalyticsCookies(undefined), []);
  const throwing = { get cookie(): string { throw new Error('blocked'); }, location: { hostname: 'x' } } as unknown as Document;
  assert.deepEqual(clearAnalyticsCookies(throwing), []);
});

test('Decline saves the choice, tells the container, and deletes the cookies; Accept keeps them', () => {
  const declined = { storage: fakeStorage(), dataLayer: [] as unknown[], cookies: fakeDocument('_ga=1', 'www.forgedsa.co.za') };
  chooseConsent('denied', { localStorage: declined.storage, dataLayer: declined.dataLayer, document: declined.cookies.doc } as unknown as Window);
  assert.equal(declined.storage.data[CONSENT_STORAGE_KEY], 'denied');
  assert.deepEqual(Array.from(declined.dataLayer[0] as ArrayLike<unknown>), ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.ok(declined.cookies.writes.length > 0);

  const accepted = { storage: fakeStorage(), dataLayer: [] as unknown[], cookies: fakeDocument('_ga=1', 'www.forgedsa.co.za') };
  chooseConsent('granted', { localStorage: accepted.storage, dataLayer: accepted.dataLayer, document: accepted.cookies.doc } as unknown as Window);
  assert.equal(accepted.storage.data[CONSENT_STORAGE_KEY], 'granted');
  assert.deepEqual(Array.from(accepted.dataLayer[0] as ArrayLike<unknown>), ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(accepted.cookies.writes.length, 0);
});

test('openCookieSettings fires the event the banner listens for', () => {
  const fired: string[] = [];
  openCookieSettings({ dispatchEvent: (e: Event) => fired.push(e.type) } as unknown as Window);
  assert.deepEqual(fired, [CONSENT_SETTINGS_EVENT]);
});
