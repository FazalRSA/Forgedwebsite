import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAllBrandWheels, formatZAR, getWheelImages } from '../data/catalogue';
import {
  buildDesignCards,
  cutoutSrcFor,
  designCardWidths,
  designOf,
  planDesignRows,
} from './designCards';

const publicDir = join(import.meta.dirname, '..', '..', 'public');

test('rows of 3 and 2 alternate, and a lone last card fills its row', () => {
  assert.deepEqual(planDesignRows(0), []);
  assert.deepEqual(planDesignRows(1), [1]);
  assert.deepEqual(planDesignRows(2), [2]);
  assert.deepEqual(planDesignRows(3), [3]);
  assert.deepEqual(planDesignRows(4), [3, 1]);
  assert.deepEqual(planDesignRows(5), [3, 2]);
  assert.deepEqual(planDesignRows(6), [3, 2, 1]);
  assert.deepEqual(planDesignRows(8), [3, 2, 3]);
  assert.deepEqual(planDesignRows(11), [3, 2, 3, 2, 1]);
  for (let n = 0; n <= 20; n += 1) {
    assert.equal(planDesignRows(n).reduce((a, b) => a + b, 0), n);
  }
});

test('card widths follow the row plan', () => {
  assert.deepEqual(designCardWidths(6), ['third', 'third', 'third', 'half', 'half', 'full']);
  assert.deepEqual(designCardWidths(2), ['half', 'half']);
  assert.deepEqual(designCardWidths(1), ['full']);
});

test('one card per design, in catalogue order, with facts from the data', () => {
  const wheels = getAllBrandWheels();
  const cards = buildDesignCards(wheels);
  const designs = Array.from(new Set(wheels.map(designOf)));
  assert.deepEqual(cards.map((c) => c.design), designs);
  assert.equal(cards.reduce((n, c) => n + c.listings.length, 0), wheels.length);

  for (const card of cards) {
    assert.ok(card.listings.every((w) => designOf(w) === card.design));
    assert.ok(card.listings.includes(card.representative));
    const min = Math.min(...card.listings.map((w) => w.priceZAR));
    assert.ok(card.priceLine.includes(formatZAR(min)));
    assert.ok(card.priceLine.endsWith('per set of 4'));
    assert.equal(
      card.badge,
      card.listings.length > 1 ? `${card.listings.length} finishes in stock` : 'In stock'
    );
    assert.ok(card.label.startsWith(`${card.design}, `));
    assert.ok(card.label.includes(formatZAR(min)));
    if (card.photo) assert.ok(!card.photo.startsWith('data:'));
  }
});

test('the representative is the first listing of its design with a real photo', () => {
  const cards = buildDesignCards(getAllBrandWheels());
  for (const card of cards) {
    const withPhoto = card.listings.find((w) => !getWheelImages(w).images[1].startsWith('data:'));
    assert.equal(card.representative, withPhoto ?? card.listings[0]);
  }
});

test('cut-out paths come only from the site photos', () => {
  assert.equal(cutoutSrcFor('/images/wheels/fsa002-gold/hero.webp'), '/images/wheels/fsa002-gold/cutout.webp');
  assert.equal(cutoutSrcFor('/images/wheels/fsa002-gold/front.webp'), undefined);
  assert.equal(cutoutSrcFor('https://example.com/hero.webp'), undefined);
  assert.equal(cutoutSrcFor('data:image/svg+xml,abc'), undefined);
  assert.equal(cutoutSrcFor(undefined), undefined);
});

test('every listing photographed on the site has a cut-out on disk', () => {
  for (const wheel of getAllBrandWheels()) {
    const cutout = cutoutSrcFor(getWheelImages(wheel).images[1]);
    if (!cutout) continue;
    assert.ok(
      existsSync(join(publicDir, cutout)),
      `${wheel.slug}: ${cutout} is missing; run scripts/make-wheel-cutouts.py`
    );
  }
  for (const card of buildDesignCards(getAllBrandWheels())) {
    if (card.cutout) assert.ok(existsSync(join(publicDir, card.cutout)), `${card.design}: ${card.cutout}`);
  }
});
