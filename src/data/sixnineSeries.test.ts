import test from 'node:test';
import assert from 'node:assert/strict';
import rangeJson from './sixnineRange.json';
import { getAllBrandWheels, isSixnineWheel } from './catalogue';
import {
  diameterRange,
  findSixnineSeries,
  finishSwatch,
  seriesFacts,
  seriesPath,
  SIXNINE_FINISH_SWATCH,
  SIXNINE_SERIES,
  sixnineSeriesOfWheel,
  sizeLine,
  sortedSizes,
} from './sixnineSeries';

test('the six Sixnine series, each with a page address under /sixnine-wheels', () => {
  assert.deepEqual(
    SIXNINE_SERIES.map((s) => s.code),
    ['FF-ONE', 'FF-TWO', 'FF-THREE', 'EVO-ONE', 'EVO-TWO', 'OEM+ONE']
  );
  assert.deepEqual(
    SIXNINE_SERIES.map(seriesPath),
    ['/sixnine-wheels/ff-one', '/sixnine-wheels/ff-two', '/sixnine-wheels/ff-three', '/sixnine-wheels/evo-one', '/sixnine-wheels/evo-two', '/sixnine-wheels/oem-plus-one']
  );
  assert.equal(findSixnineSeries('FF-ONE')?.code, 'FF-ONE');
  assert.equal(findSixnineSeries('not-a-series'), undefined);
});

test('the range holds wheel specifications only: no prices, stock, certificates or shop links', () => {
  const keys = new Set(SIXNINE_SERIES.flatMap((s) => s.sizes.flatMap((z) => Object.keys(z))));
  for (const key of keys) assert.doesNotMatch(key, /price|eur|stock|certificate|url|page|delivery/i, key);
  assert.doesNotMatch(JSON.stringify(rangeJson), /€|EUR\b/);
  assert.equal(rangeJson.source.scrapedOn, '2026-11-19');
});

test('every size has a bolt pattern, and every single wheel a diameter, a width and Sixnine finish names with a swatch', () => {
  for (const series of SIXNINE_SERIES) {
    assert.ok(series.sizes.length > 0, series.code);
    for (const size of series.sizes) {
      assert.ok(size.boltPatterns.length >= 1, `${series.code} ${size.size}`);
      for (const pcd of size.boltPatterns) assert.match(pcd, /^5x\d{3}(\.\d)?$/, pcd);
      if (size.soldAs === 'wheel') {
        assert.ok(size.diameter && size.width, `${series.code} ${size.size}`);
        assert.ok(size.finishes.length > 0, `${series.code} ${size.size}`);
        for (const finish of size.finishes) assert.ok(finish in SIXNINE_FINISH_SWATCH, `${finish} has no swatch`);
      } else {
        assert.ok(size.finishesText, `${series.code} set without its finish text`);
      }
    }
  }
  assert.match(finishSwatch('HyperSilver'), /^linear-gradient\(135deg, #E4E4E4, #A3A3A3\)$/);
});

test('facts are worked out from the sizes', () => {
  const ffOne = seriesFacts(findSixnineSeries('ff-one')!);
  assert.equal(diameterRange(ffOne), '19″ to 22″');
  assert.ok(ffOne.boltPatterns.includes('5x112'));
  assert.equal(ffOne.dualBoltPattern, false);
  assert.equal(seriesFacts(findSixnineSeries('evo-one')!).dualBoltPattern, true);
  assert.equal(diameterRange(seriesFacts(findSixnineSeries('ff-two')!)), '21″');
  // A series is called flow forged only when most of its sizes say so.
  assert.equal(findSixnineSeries('evo-one')!.construction, null);
  assert.equal(findSixnineSeries('ff-three')!.construction, 'Flow forged');
});

test('sizes read the Sixnine way and sort by diameter, width and offset, sets last', () => {
  const sizes = sortedSizes(findSixnineSeries('ff-one')!);
  assert.equal(sizeLine(sizes[0]), '8.5x19 ET45 · 5x112');
  assert.equal(sizes[sizes.length - 1].soldAs, 'set');
  for (let i = 1; i < sizes.length - 1; i += 1) {
    assert.ok((sizes[i - 1].diameter ?? 0) <= (sizes[i].diameter ?? 0));
  }
  const dual = findSixnineSeries('evo-two')!.sizes[0];
  assert.match(sizeLine(dual), / · 5x112 \/ 5x120$/);
});

test('every Sixnine listing in stock belongs to a Sixnine series (FF-1 is the FF-ONE, FF-3 the FF-THREE)', () => {
  const sixnine = getAllBrandWheels().filter(isSixnineWheel);
  assert.ok(sixnine.length > 0);
  for (const wheel of sixnine) assert.ok(sixnineSeriesOfWheel(wheel), `${wheel.slug} (${wheel.modelCode}) maps to no series`);
  assert.equal(sixnineSeriesOfWheel({ modelCode: 'FF-1' })?.code, 'FF-ONE');
  assert.equal(sixnineSeriesOfWheel({ modelCode: 'ff-3' })?.code, 'FF-THREE');
  assert.equal(sixnineSeriesOfWheel({ modelCode: 'FSA001' }), undefined);
});

test('About Sixnine: every fact names a Sixnine page as its source, and no German approval is claimed', async () => {
  const { SIXNINE_ABOUT, SIXNINE_PERSONALISATION, SIXNINE_SOURCES } = await import('./sixnineAbout');
  for (const url of Object.values(SIXNINE_SOURCES)) assert.match(url, /^https:\/\/sixnine-wheels\.com\//);
  assert.equal(SIXNINE_ABOUT.configuratorLooks, 3950);
  assert.equal(SIXNINE_PERSONALISATION.length, 3);
  const text = JSON.stringify([SIXNINE_ABOUT, SIXNINE_PERSONALISATION]);
  assert.doesNotMatch(text, /T[ÜU]V|certif|approv/i);
});
