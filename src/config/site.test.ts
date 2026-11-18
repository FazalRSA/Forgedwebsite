import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { SITE } from './site';

// A published email must sit on the business's own domain. An address on a domain the business
// does not own sends real privacy requests to a stranger.
test('published emails are empty or on the business domain', () => {
  for (const [field, value] of [['tradeEmail', SITE.tradeEmail], ['privacyEmail', SITE.privacyEmail]] as const) {
    if (value === '') continue;
    assert.ok(
      value.toLowerCase().endsWith(`@${SITE.domain}`),
      `SITE.${field} is "${value}", which is not on ${SITE.domain}`,
    );
  }
});

// The notice must describe the site as it is. These features were removed, so the notice must not
// promise or describe them.
test('privacy notice does not describe features the site no longer has', () => {
  const source = readFileSync(new URL('../components/brand/PrivacyPolicyPage.tsx', import.meta.url), 'utf8');
  // "newsletter" is not listed: the notice may truthfully say the site has none.
  const removed = /firebase|firestore|google account|sign in with google|garage|dealer application|allocation alert|client account/i;
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
