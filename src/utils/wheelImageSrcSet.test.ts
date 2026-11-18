import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAllBrandWheels, getWheelImages } from '../data/catalogue';
import { buildDesignCards } from './designCards';
import { WHEEL_IMAGE_WIDTHS, wheelImageSrcSet, wheelImageVariants } from './wheelImageSrcSet';

const publicDir = join(import.meta.dirname, '..', '..', 'public');

test('a site photo gets a srcset of its smaller copies, smallest first, and the sizes it was given', () => {
  assert.deepEqual(wheelImageSrcSet('/images/wheels/fsa003-gold/front.webp', '60vw'), {
    src: '/images/wheels/fsa003-gold/front.webp',
    srcSet:
      '/images/wheels/fsa003-gold/front-400.webp 400w, /images/wheels/fsa003-gold/front-800.webp 800w, /images/wheels/fsa003-gold/front.webp 1600w',
    sizes: '60vw',
  });
  for (const name of ['hero', 'profile']) {
    const { srcSet } = wheelImageSrcSet(`/images/wheels/ff-1-silver/${name}.webp`, '100vw');
    assert.equal(
      srcSet,
      `/images/wheels/ff-1-silver/${name}-400.webp 400w, /images/wheels/ff-1-silver/${name}-800.webp 800w, /images/wheels/ff-1-silver/${name}.webp 1600w`
    );
  }
});

test('a cut-out keeps its own widths', () => {
  assert.deepEqual(wheelImageSrcSet('/images/wheels/fsa003-gold/cutout.webp', '(min-width:1024px) 350px, 60vw'), {
    src: '/images/wheels/fsa003-gold/cutout.webp',
    srcSet: '/images/wheels/fsa003-gold/cutout-600.webp 600w, /images/wheels/fsa003-gold/cutout.webp 1000w',
    sizes: '(min-width:1024px) 350px, 60vw',
  });
});

test('anything that is not a site photo gets only its src, with no srcset or sizes', () => {
  for (const src of [
    '',
    'data:image/svg+xml,abc',
    'https://example.com/front.webp',
    '/images/wheels/fsa003-gold/other.webp',
    '/images/wheels/fsa003-gold/front.png',
    '/images/wheels/fsa003-gold/front-800.webp',
    '/images/wheels/fsa003-gold/nested/front.webp',
    '/images/partners/front.webp',
  ]) {
    assert.deepEqual(wheelImageSrcSet(src, '100vw'), { src });
    assert.deepEqual(wheelImageVariants(src), []);
  }
});

test('the widths in the srcset match the table and end with the original file', () => {
  for (const [name, widths] of Object.entries(WHEEL_IMAGE_WIDTHS)) {
    const src = `/images/wheels/any-slug/${name}.webp`;
    const { srcSet } = wheelImageSrcSet(src, '1px');
    const entries = (srcSet ?? '').split(', ');
    assert.equal(entries.length, widths.length);
    assert.deepEqual(
      entries.map((e) => Number(e.split(' ')[1].replace(/w$/, ''))),
      [...widths]
    );
    assert.equal(entries.at(-1), `${src} ${widths.at(-1)}w`);
    assert.deepEqual(wheelImageVariants(src), entries.slice(0, -1).map((e) => e.split(' ')[0]));
  }
});

test('every smaller copy of every photographed listing exists on disk', () => {
  const photos = new Set<string>();
  for (const wheel of getAllBrandWheels()) {
    for (const src of getWheelImages(wheel).images) photos.add(src);
  }
  for (const card of buildDesignCards(getAllBrandWheels())) {
    if (card.cutout) photos.add(card.cutout);
    if (card.photo) photos.add(card.photo);
  }
  let checked = 0;
  for (const src of photos) {
    for (const variant of wheelImageVariants(src)) {
      assert.ok(
        existsSync(join(publicDir, variant)),
        `${variant} is missing; run scripts/make-wheel-sizes.py`
      );
      checked += 1;
    }
  }
  assert.ok(checked > 0, 'no site photos were checked');
});
