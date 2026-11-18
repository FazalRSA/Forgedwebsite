import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { googleTagManagerBody, googleTagManagerHead, googleTagManagerId, withGoogleTagManager } from './googleTagManager';

const SET_UP = { googleTagManagerId: 'GTM-P554MVX4', host: 'www.example.co.za' };
const NOT_SET_UP = { ...SET_UP, googleTagManagerId: '' };

const SHELL = [
  '<!doctype html>',
  '<html lang="en-ZA">',
  '  <head>',
  '    <meta charset="UTF-8" />',
  '    <title>Page</title>',
  '  </head>',
  '  <body class="bg-black">',
  '    <div id="root"></div>',
  '  </body>',
  '</html>',
].join('\n');

/** Run the <head> snippet's script as a browser on `hostname` would, and report what it did. */
function runHeadSnippet(hostname: string, storedConsent: string | null = null, storageThrows = false) {
  const script = googleTagManagerHead(SET_UP).match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, 'the head snippet has a script');
  const inserted: Array<{ src: string; async: boolean }> = [];
  const firstScript = { parentNode: { insertBefore: (el: (typeof inserted)[number]) => inserted.push(el) } };
  const window: Record<string, unknown> = {};
  const document = {
    getElementsByTagName: () => [firstScript],
    createElement: () => ({ src: '', async: false }),
  };
  const localStorage = {
    getItem: (key: string) => {
      if (storageThrows) throw new Error('blocked');
      return key === 'forged-analytics-consent' ? storedConsent : null;
    },
  };
  window.localStorage = localStorage;
  vm.runInNewContext(script, { window, document, location: { hostname } });
  const dataLayer = window.dataLayer as unknown[] | undefined;
  // Consent commands are Arguments objects (as gtag() pushes them); the rest are plain objects.
  const consent: unknown[][] = JSON.parse(
    JSON.stringify(
      (dataLayer ?? [])
        .filter((e) => Object.prototype.toString.call(e) === '[object Arguments]')
        .map((e) => Array.from(e as ArrayLike<unknown>))
    )
  );
  const events = (dataLayer ?? []).filter((e) => Object.prototype.toString.call(e) !== '[object Arguments]') as Array<Record<string, unknown>>;
  return { inserted, dataLayer: dataLayer === undefined ? undefined : events, consent, raw: dataLayer };
}

const ALL_DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };

test('Google Tag Manager is off until a container ID is set, and a malformed ID is refused', () => {
  assert.equal(googleTagManagerId(NOT_SET_UP), null);
  for (const bad of ['GTM-', 'gtm-p554mvx4', 'G-H2TR6RVSK0', "GTM-P554MVX4');alert(1)//", 'GTM-P554MVX4"><script>']) {
    assert.equal(googleTagManagerId({ ...SET_UP, googleTagManagerId: bad }), null, bad);
  }
  assert.equal(googleTagManagerHead(NOT_SET_UP), '');
  assert.equal(googleTagManagerBody(NOT_SET_UP), '');
  assert.equal(withGoogleTagManager(SHELL, NOT_SET_UP), SHELL);
});

test('a valid container ID is accepted', () => {
  assert.equal(googleTagManagerId(SET_UP), 'GTM-P554MVX4');
});

test('the head snippet loads the container, with the gtm.js start event, on the production host', () => {
  const { inserted, dataLayer } = runHeadSnippet('www.example.co.za');
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-P554MVX4');
  assert.equal(inserted[0].async, true);
  assert.equal(dataLayer?.length, 1);
  assert.equal(dataLayer?.[0].event, 'gtm.js');
  assert.equal(typeof dataLayer?.[0]['gtm.start'], 'number');
});

test('consent is denied by default, before the container starts, for a visitor who has not chosen', () => {
  const { consent, raw } = runHeadSnippet('www.example.co.za');
  assert.deepEqual(consent, [['consent', 'default', ALL_DENIED]]);
  const startIndex = raw!.findIndex((e) => (e as Record<string, unknown>).event === 'gtm.js');
  assert.ok(startIndex > 0, 'the consent default is pushed before the gtm.js start event');
});

test('an earlier "Accept" grants analytics only; an earlier "Decline" or blocked storage keeps everything denied', () => {
  assert.deepEqual(runHeadSnippet('www.example.co.za', 'granted').consent, [
    ['consent', 'default', ALL_DENIED],
    ['consent', 'update', { analytics_storage: 'granted' }],
  ]);
  assert.deepEqual(runHeadSnippet('www.example.co.za', 'denied').consent, [['consent', 'default', ALL_DENIED]]);
  const blocked = runHeadSnippet('www.example.co.za', null, true);
  assert.deepEqual(blocked.consent, [['consent', 'default', ALL_DENIED]]);
  assert.equal(blocked.inserted.length, 1, 'blocked storage does not stop the container loading');
});

test('the head snippet does nothing on any other host (a Render preview, localhost)', () => {
  for (const hostname of ['forgedsa.onrender.com', 'localhost', 'example.co.za']) {
    const { inserted, dataLayer } = runHeadSnippet(hostname);
    assert.equal(inserted.length, 0, hostname);
    assert.equal(dataLayer, undefined, hostname);
  }
});

test('the noscript fallback points at the same container', () => {
  assert.match(googleTagManagerBody(SET_UP), /<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-P554MVX4"/);
});

test('the script goes straight after the charset declaration and the noscript straight after <body>', () => {
  const html = withGoogleTagManager(SHELL, SET_UP);
  const charset = html.indexOf('<meta charset="UTF-8" />');
  const script = html.indexOf('<!-- Google Tag Manager (production host only');
  const title = html.indexOf('<title>');
  assert.ok(charset < script && script < title, 'script sits between the charset and the rest of <head>');
  const body = html.indexOf('<body class="bg-black">');
  const noscript = html.indexOf('<!-- Google Tag Manager (noscript) -->');
  const root = html.indexOf('<div id="root">');
  assert.ok(body < noscript && noscript < root, 'noscript sits straight after <body>');
  assert.ok(html.indexOf('<noscript><iframe') > html.indexOf('</head>'), 'the iframe is never inside <head>');
});

test('adding the snippet twice changes nothing the second time', () => {
  const once = withGoogleTagManager(SHELL, SET_UP);
  assert.equal(withGoogleTagManager(once, SET_UP), once);
  assert.equal(once.split('googletagmanager.com/gtm.js').length, 2);
});

test('a shell without <head> or <body> is returned unchanged', () => {
  assert.equal(withGoogleTagManager('<div id="root"></div>', SET_UP), '<div id="root"></div>');
  assert.equal(withGoogleTagManager('<head></head><div></div>', SET_UP), '<head></head><div></div>');
});

test("the site's own index.html takes the snippet in the right places", () => {
  const shell = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  assert.ok(!shell.includes('googletagmanager'), 'index.html must not carry the snippet itself; the build adds it');
  const html = withGoogleTagManager(shell, SET_UP);
  assert.ok(html.indexOf('googletagmanager.com/gtm.js') < html.indexOf('<meta name="viewport"'));
  assert.ok(html.indexOf('</head>') < html.indexOf('ns.html?id=GTM-P554MVX4'));
  assert.ok(html.indexOf('ns.html?id=GTM-P554MVX4') < html.indexOf('<div id="root">'));
});
