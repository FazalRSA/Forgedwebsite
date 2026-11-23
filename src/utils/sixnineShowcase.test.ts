import test from 'node:test';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { getAllBrandWheels, isSixnineWheel } from '../data/catalogue';
import { findSixnineSeries, SIXNINE_SERIES } from '../data/sixnineSeries';
import { showcasePicture, sixnineNews } from './sixnineShowcase';

const wheels = getAllBrandWheels().filter(isSixnineWheel);

test('every series has a showcase picture, the shop\'s own angled cut-out first', () => {
  for (const series of SIXNINE_SERIES) {
    const picture = showcasePicture(series, wheels);
    assert.ok(picture, `${series.code} has no picture`);
    assert.ok(existsSync(`public${picture.src}`), `${picture.src} is missing from public/`);
  }
  // FF-ONE and FF-THREE are in stock and photographed, so they show the shop's own cut-out.
  for (const slug of ['ff-one', 'ff-three']) {
    const picture = showcasePicture(findSixnineSeries(slug)!, wheels);
    assert.match(picture!.src, /^\/images\/wheels\/ff-[13]-[a-z-]+\/cutout\.webp$/);
    assert.equal(picture!.angled, true);
  }
  // A series the shop has not photographed falls back to the face-on range picture.
  const evoTwo = showcasePicture(findSixnineSeries('evo-two')!, wheels);
  assert.deepEqual(evoTwo, { src: '/images/sixnine/evo-two.webp', angled: false });
});

test('"New at Sixnine" lists only what Sixnine has on pre-order', () => {
  const news = sixnineNews();
  assert.ok(news.length > 0);
  for (const item of news) {
    assert.equal(item.badge, 'Pre-order');
    assert.ok(item.series.sizes.some((size) => size.preOrder), `${item.title} has no pre-order size`);
  }
  // A whole series on pre-order is one card linking to its page; a single pre-order size names its car.
  const evoTwo = news.find((item) => item.title === 'EVO-TWO');
  assert.equal(evoTwo?.to, '/sixnine-wheels/evo-two');
  const rs5 = news.find((item) => item.series.code === 'FF-THREE');
  assert.equal(rs5?.title, 'FF-THREE for Audi RS5 B10');
  assert.equal(rs5?.to, '/sixnine-wheels/ff-three#sizes');
});
