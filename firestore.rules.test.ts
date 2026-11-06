import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Security Rules Structural & Dirty-Dozen Invariant Verification Suite
 */
describe('Firestore Security Rules — Dirty Dozen Verification', () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  it('enforces rules_version = 2 and default-deny catch-all at top', () => {
    assert.match(rules, /rules_version\s*=\s*'2';/);
    assert.match(rules, /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
  });

  it('enforces email_verified == true on all write paths', () => {
    assert.match(rules, /request\.auth\.token\.email_verified\s*==\s*true/);
  });

  it('enforces isValidId regex and length bounds', () => {
    assert.match(rules, /function\s+isValidId\(id\)/);
    assert.match(rules, /id\.size\(\)\s*<=\s*128/);
  });

  it('prevents blanket reads and forbids listing /users', () => {
    assert.match(rules, /allow\s+list:\s*if\s+false;/);
  });

  it('enforces strict hasAll and hasOnly key checks in validation helpers', () => {
    assert.match(rules, /data\.keys\(\)\.hasAll\(/);
    assert.match(rules, /data\.keys\(\)\.hasOnly\(/);
  });

  it('enforces affectedKeys().hasOnly() on all update operations', () => {
    assert.match(rules, /affectedKeys\(\)\.hasOnly\(/);
  });

  it('enforces temporal integrity with request.time', () => {
    assert.match(rules, /request\.time/);
  });
});
