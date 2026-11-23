import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { configuratorBuildLink, installsThisYearLine, SITE } from './site';

// A published email must sit on the business's own domain. An address on a domain the business
// does not own sends real privacy requests to a stranger.
test('published emails are empty or on the business domain', () => {
  for (const [field, value] of [['tradeEmail', SITE.tradeEmail], ['privacyEmail', SITE.privacyEmail], ['supportEmail', SITE.supportEmail]] as const) {
    if (value === '') continue;
    assert.ok(
      value.toLowerCase().endsWith(`@${SITE.domain}`),
      `SITE.${field} is "${value}", which is not on ${SITE.domain}`,
    );
  }
});

// The notice must describe the site as it is. These features were removed, so the notice must not
// promise or describe them. (Customer accounts are back, on Supabase and shared with the configurator, so
// "Google account" and "garage" are now true; Firebase, the old dealer application and the allocation list stay gone.)
test('privacy notice does not describe features the site no longer has', () => {
  const source = readFileSync(new URL('../components/brand/PrivacyPolicyPage.tsx', import.meta.url), 'utf8');
  // "newsletter" is not listed: the notice may truthfully say the site has none.
  const removed = /firebase|firestore|dealer application|allocation alert|client account/i;
  const hit = source.match(removed);
  assert.equal(hit, null, `privacy notice still mentions "${hit?.[0]}"`);
});

// Visit statistics and Search Console are set up from this file. A half-filled or malformed value
// would silently do nothing, so the pairs are checked here.
test('visit statistics are either fully set up or fully off, and the values are well formed', () => {
  const { analyticsScriptUrl, analyticsWebsiteId, searchConsoleToken } = SITE;
  assert.equal(Boolean(analyticsScriptUrl), Boolean(analyticsWebsiteId), 'set both analyticsScriptUrl and analyticsWebsiteId, or neither');
  if (analyticsScriptUrl) {
    assert.ok(analyticsScriptUrl.startsWith('https://'), 'analyticsScriptUrl must be https');
    assert.match(analyticsWebsiteId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  }
  if (searchConsoleToken) assert.match(searchConsoleToken, /^[A-Za-z0-9_-]{16,128}$/);
});

// A mistyped container ID would silently load nothing (src/utils/googleTagManager.ts refuses it).
test('the Google Tag Manager container ID is empty or well formed', () => {
  if (SITE.googleTagManagerId) assert.match(SITE.googleTagManagerId, /^GTM-[A-Z0-9]{4,12}$/);
});

// The car preview is off while this is empty. A set value must be an https address: the visitor's
// photo is sent to it, so it must never go over plain http.
test('the car-preview address is empty or an https address', () => {
  const { carPreviewUrl } = SITE;
  if (carPreviewUrl === '') return;
  assert.ok(carPreviewUrl.startsWith('https://'), 'carPreviewUrl must be https');
  assert.doesNotThrow(() => new URL(carPreviewUrl), 'carPreviewUrl must be a valid URL');
});

// Accounts are shared with the configurator; a saved build links there, so the address must be https.
test('the configurator address is empty or an https address, and builds link to it', () => {
  if (SITE.configuratorUrl === '') return;
  assert.ok(SITE.configuratorUrl.startsWith('https://'), 'configuratorUrl must be https');
  assert.doesNotThrow(() => new URL(SITE.configuratorUrl));
  assert.equal(configuratorBuildLink('AB12CD'), `${SITE.configuratorUrl.replace(/\/+$/, '')}/?config=AB12CD`);
  assert.equal(configuratorBuildLink(''), null);
});

test('the host is the domain or www.<domain>', () => {
  assert.ok(SITE.host === SITE.domain || SITE.host === `www.${SITE.domain}`);
});

test('social and Google review links are empty or https, and the rating is real', () => {
  for (const url of [SITE.instagramUrl, SITE.facebookUrl, SITE.tiktokUrl, SITE.youtubeUrl, SITE.googleReviewsUrl, SITE.googleWriteReviewUrl]) {
    if (url) assert.ok(url.startsWith('https://'), `${url} must be https`);
  }
  assert.equal(SITE.googleRating === null, SITE.googleReviewCount === null, 'set the rating and the review count together');
  if (SITE.googleRating !== null) {
    assert.ok(SITE.googleRating >= 1 && SITE.googleRating <= 5);
    assert.ok(Number.isInteger(SITE.googleReviewCount) && (SITE.googleReviewCount as number) > 0);
  }
});

test('the installs line reads as the owner wrote it, and only during the year it counts', () => {
  const installs = { wheels: 80, year: 2026 };
  assert.equal(installsThisYearLine(new Date('2026-11-20T10:00:00Z'), installs), 'Over 80 successful wheels installed this year.');
  assert.equal(installsThisYearLine(new Date('2026-01-01T10:00:00Z'), installs), 'Over 80 successful wheels installed this year.');
  assert.equal(installsThisYearLine(new Date('2027-01-01T10:00:00Z'), installs), null, 'gone once the year is over');
  assert.equal(installsThisYearLine(new Date('2025-12-31T10:00:00Z'), installs), null);
  assert.equal(installsThisYearLine(new Date('2026-06-01T10:00:00Z'), null), null);
  assert.equal(installsThisYearLine(new Date('2026-06-01T10:00:00Z'), { wheels: 0, year: 2026 }), null);
  if (SITE.installsThisYear) {
    assert.ok(Number.isInteger(SITE.installsThisYear.wheels) && SITE.installsThisYear.wheels > 0);
    assert.ok(Number.isInteger(SITE.installsThisYear.year) && SITE.installsThisYear.year >= 2026);
  }
});
