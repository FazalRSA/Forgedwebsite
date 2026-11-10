import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyRedirect, normalizePath, redirectFor } from './redirects';

test('old store addresses go to the in-stock wheels on the home page', () => {
  for (const old of [
    '/store',
    '/store/',
    '/store/collections/bmw-m3-2024-onwards-alloy-wheels',
    '/store/products/bmw-m3-type-52-forged',
  ]) {
    assert.equal(redirectFor(old), '/#catalogue', old);
  }
});

test('the Sixnine dealer page is a real page, and its old longer address goes to it', () => {
  for (const real of ['/sixnine-wheels', '/sixnine-wheels/']) {
    assert.equal(redirectFor(real), null, real);
  }
  for (const old of ['/official-dealer-sixnine-wheels', '/official-dealer-sixnine-wheels/']) {
    assert.equal(redirectFor(old), '/sixnine-wheels', old);
  }
});

test('/client-fitments and /store/client-fitments go to /installs', () => {
  for (const old of ['/client-fitments', '/client-fitments/', '/store/client-fitments', '/store/client-fitments/']) {
    assert.equal(redirectFor(old), '/installs', old);
  }
});

test('account, garage and dealer addresses go to /contact', () => {
  for (const old of [
    '/account',
    '/account/',
    '/garage',
    '/garage/',
    '/dealer-application',
    '/dealer-application/',
    '/store/dealer-application',
  ]) {
    assert.equal(redirectFor(old), '/contact', old);
  }
});

test('a bare /wheels has no page and goes to the catalogue', () => {
  assert.equal(redirectFor('/wheels'), '/#catalogue');
  assert.equal(redirectFor('/wheels/'), '/#catalogue');
});

test('matching ignores case, query strings and hashes', () => {
  assert.equal(redirectFor('/Store/Products/X'), '/#catalogue');
  assert.equal(redirectFor('/client-fitments?utm_source=x'), '/installs');
  assert.equal(redirectFor('/account#top'), '/contact');
});

test('the pages that exist, and look-alike paths, are not redirected', () => {
  for (const real of [
    '/',
    '',
    '/index.html',
    '/wheels/fsa002-gold',
    '/installs',
    '/contact',
    '/sixnine-wheels',
    '/privacy-policy',
    '/studio/stf399',
    '/admin',
    '/admin/wheels',
    '/storefront',
    '/accounts',
    '/no-such-page',
  ]) {
    assert.equal(redirectFor(real), null, real);
  }
});

test('no redirect target is itself an old address, so a redirect can never loop', () => {
  const olds = ['/store', '/client-fitments', '/account', '/garage', '/dealer-application', '/official-dealer-sixnine-wheels', '/wheels'];
  for (const old of olds) {
    const target = redirectFor(old);
    assert.ok(target, old);
    assert.equal(redirectFor(target!), null, `${old} -> ${target}`);
  }
});

test('applyRedirect replaces the history entry (never pushes) and only for an old address', () => {
  const calls: Array<[unknown, string, string]> = [];
  const history = { replaceState: (state: unknown, unused: string, url: string) => calls.push([state, unused, url]) };

  assert.equal(applyRedirect({ pathname: '/store/products/x' }, history), true);
  assert.equal(applyRedirect({ pathname: '/client-fitments' }, history), true);
  assert.equal(applyRedirect({ pathname: '/garage' }, history), true);
  assert.deepEqual(
    calls.map((c) => c[2]),
    ['/#catalogue', '/installs', '/contact']
  );

  assert.equal(applyRedirect({ pathname: '/installs' }, history), false);
  assert.equal(applyRedirect({ pathname: '/' }, history), false);
  assert.equal(calls.length, 3, 'a current address must not touch the history');
});

test('normalizePath drops query, hash and trailing slashes', () => {
  assert.equal(normalizePath('/installs/'), '/installs');
  assert.equal(normalizePath('/installs?x=1#y'), '/installs');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath(''), '/');
  assert.equal(normalizePath('/#catalogue'), '/');
});

test('every address in scripts/legacy-pages.json has a redirect and is not a current page', () => {
  const listUrl = new URL('../../scripts/legacy-pages.json', import.meta.url);
  const legacyPaths: string[] = JSON.parse(readFileSync(listUrl, 'utf8'));
  assert.ok(legacyPaths.length > 0, 'the list of old addresses must not be empty');
  for (const old of legacyPaths) {
    const target = redirectFor(old);
    assert.ok(target, `${old} has no redirect in redirects.ts`);
    assert.notEqual(target, old, `${old} must not redirect to itself`);
  }
});
