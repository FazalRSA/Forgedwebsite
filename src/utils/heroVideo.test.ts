import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { HERO_POSTER_SRCSET, HERO_VIDEO, heroVideoAllowed } from './heroVideo';

const publicDir = join(import.meta.dirname, '..', '..', 'public');
const onDisk = (src: string) => join(publicDir, src);

// The film plays on the first screen of the home page, on South African mobile data. Keep it small:
// these budgets are about twice today's files, room for a longer film but not for a raw export.
const BUDGET_BYTES = { large: 3_000_000, small: 1_500_000 } as const;

test('every hero film file and poster is on disk; run scripts/make-hero-video.sh if not', () => {
  for (const size of Object.values(HERO_VIDEO)) {
    for (const file of [size.poster, ...size.sources.map((s) => s.src)]) {
      assert.ok(existsSync(onDisk(file)), `${file} is missing`);
    }
  }
});

test('each size offers AV1 first, then H.264 that plays everywhere', () => {
  for (const [name, size] of Object.entries(HERO_VIDEO)) {
    assert.equal(size.sources.length, 2, name);
    assert.match(size.sources[0].type, /^video\/mp4; codecs="av01\./, `${name}: AV1 first`);
    assert.match(size.sources[1].type, /^video\/mp4; codecs="avc1\./, `${name}: H.264 last`);
  }
});

test('the hero film stays within its download budget, and AV1 is the smaller file', () => {
  for (const [name, size] of Object.entries(HERO_VIDEO) as [keyof typeof BUDGET_BYTES, (typeof HERO_VIDEO)['large']][]) {
    const [av1, h264] = size.sources.map((s) => statSync(onDisk(s.src)).size);
    assert.ok(h264 <= BUDGET_BYTES[name], `${size.sources[1].src} is ${h264} bytes, over ${BUDGET_BYTES[name]}`);
    assert.ok(av1 < h264, `${size.sources[0].src} should be smaller than ${size.sources[1].src}`);
  }
});

test('each film file can start before it has finished downloading (moov before mdat)', () => {
  for (const size of Object.values(HERO_VIDEO)) {
    for (const { src } of size.sources) {
      const head = readFileSync(onDisk(src)).subarray(0, 64 * 1024).toString('latin1');
      const moov = head.indexOf('moov');
      const mdat = head.indexOf('mdat');
      assert.ok(moov !== -1 && (mdat === -1 || moov < mdat), `${src}: encode with -movflags +faststart`);
    }
  }
});

test('the poster srcset lists both stills with their widths', () => {
  assert.equal(
    HERO_POSTER_SRCSET,
    `${HERO_VIDEO.small.poster} ${HERO_VIDEO.small.width}w, ${HERO_VIDEO.large.poster} ${HERO_VIDEO.large.width}w`
  );
});

test('the film plays only when the visitor asked neither for less motion nor to save data', () => {
  assert.equal(heroVideoAllowed({ reducedMotion: false, saveData: false }), true);
  assert.equal(heroVideoAllowed({ reducedMotion: true, saveData: false }), false);
  assert.equal(heroVideoAllowed({ reducedMotion: false, saveData: true }), false);
  assert.equal(heroVideoAllowed({ reducedMotion: true, saveData: true }), false);
});
