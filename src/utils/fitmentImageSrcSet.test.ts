import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CLIENT_FITMENTS } from '../data/clientFitments';
import { FITMENT_IMAGE_WIDTHS, fitmentImageSrcSet, fitmentThumbnail } from './fitmentImageSrcSet';

const publicDir = join(import.meta.dirname, '..', '..', 'public');

test('a studio photo gets its 800 px copy first, then the original, and the sizes it was given', () => {
  assert.deepEqual(fitmentImageSrcSet('/assets/fitments/f80-m3-yas-marina-blue/front34.webp', '48vw'), {
    src: '/assets/fitments/f80-m3-yas-marina-blue/front34.webp',
    srcSet:
      '/assets/fitments/f80-m3-yas-marina-blue/front34_800.webp 800w, /assets/fitments/f80-m3-yas-marina-blue/front34.webp 1600w',
    sizes: '48vw',
  });
  const side = fitmentImageSrcSet('/assets/fitments/f80-m3-yas-marina-blue/side.webp', '100vw');
  assert.equal(
    side.srcSet,
    '/assets/fitments/f80-m3-yas-marina-blue/side_800.webp 800w, /assets/fitments/f80-m3-yas-marina-blue/side.webp 1600w'
  );
  assert.deepEqual(FITMENT_IMAGE_WIDTHS, [800, 1600]);
});

test("the owner's photo, whose shape varies, keeps only its src; so does anything that is not an install photo", () => {
  assert.deepEqual(fitmentImageSrcSet('/assets/fitments/f80-m3-yas-marina-blue/original.webp', '48vw'), {
    src: '/assets/fitments/f80-m3-yas-marina-blue/original.webp',
  });
  for (const src of [
    '',
    'data:image/svg+xml,abc',
    'https://example.com/front34.webp',
    '/assets/fitments/f80-m3-yas-marina-blue/front34_800.webp',
    '/assets/fitments/f80-m3-yas-marina-blue/front34.png',
    '/assets/fitments/f80-m3-yas-marina-blue/nested/front34.webp',
    '/images/wheels/fsa003-gold/front.webp',
  ]) {
    assert.deepEqual(fitmentImageSrcSet(src, '100vw'), { src });
    assert.equal(fitmentThumbnail(src), null);
  }
});

test('every install photo has its 800 px copy on disk, and the studio photos list it in their srcset', () => {
  assert.ok(CLIENT_FITMENTS.length > 0);
  for (const fitment of CLIENT_FITMENTS) {
    for (const src of fitment.images) {
      assert.ok(existsSync(join(publicDir, src)), `${src} is missing`);
      const thumb = fitmentThumbnail(src);
      assert.ok(thumb, `${src} is not an install photo path`);
      assert.ok(existsSync(join(publicDir, thumb)), `${thumb} is missing; re-run scripts/fitment-reshoot/build_site_data.py`);
    }
    const [front, side, original] = fitment.images;
    assert.ok(fitmentImageSrcSet(front, '1px').srcSet?.startsWith(`${fitmentThumbnail(front)} 800w, `), front);
    assert.ok(fitmentImageSrcSet(side, '1px').srcSet?.endsWith(`${side} 1600w`), side);
    assert.equal(fitmentImageSrcSet(original, '1px').srcSet, undefined, original);
  }
});
