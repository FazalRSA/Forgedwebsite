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
