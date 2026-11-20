/**
 * Builds /llms.txt (https://llmstxt.org): a plain Markdown summary of the business for AI
 * assistants, which cannot run this single-page app. Everything comes from the catalogue, the
 * installs list and SITE, so it cannot drift from the pages or state anything they do not.
 */
import { brandOfWheel, formatZAR, getAllBrandWheels, isForgedSaWheel, isSixnineWheel, TO_ORDER_LEAD_TIME, WHEEL_BRAND_ORDER, WHEEL_BRANDS } from '../data/catalogue';
import { designCodes, joinList } from './brandFitment';
import { diameterRange, seriesFacts, seriesPath, SIXNINE_SERIES } from '../data/sixnineSeries';
import { CLIENT_FITMENTS } from '../data/clientFitments';
import { SITE, whatsappLink } from '../config/site';
import { SITE_ORIGIN } from './seo';
import { BLOG_PILLARS, blogPillarPath, blogPostPath } from '../data/blog';
import { BLOG_POSTS, postsInPillar } from '../data/blogPosts';

/** "11 SAINT MARY'S AVENUE · BEREA" -> "11 Saint Mary's Avenue, Berea". */
function readableAddress(addressLine: string): string {
  return addressLine
    .split('·')
    .map((part) => part.trim().toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()))
    .join(', ');
}

export function buildLlmsTxt(origin: string = SITE_ORIGIN): string {
  const wheels = getAllBrandWheels();
  const prices = wheels.map((w) => w.priceZAR);
  const sets = wheels.reduce((sum, w) => sum + (w.stockQuantitySets ?? 0), 0);
  const wa = whatsappLink();
  // "FF-1 and FF-3", "FSA001, FSA002, FSA003 and FSA004": each brand's designs in stock, from the catalogue.
  const designsOf = (match: (w: (typeof wheels)[number]) => boolean, fallback: string): string =>
    joinList(designCodes(wheels.filter(match))) || fallback;
  const sixnineDesigns = designsOf(isSixnineWheel, 'FF');
  const forgedSaDesigns = designsOf(isForgedSaWheel, 'FSA');

  // Listed brand by brand (the shop's own first), in catalogue order within each brand.
  const brandRank = (w: (typeof wheels)[number]) => {
    const brand = brandOfWheel(w);
    return brand ? WHEEL_BRAND_ORDER.indexOf(brand) : WHEEL_BRAND_ORDER.length;
  };
  const wheelLines = [...wheels].sort((a, b) => brandRank(a) - brandRank(b)).map((w) => {
    const brand = brandOfWheel(w);
    const facts = [
      brand ? WHEEL_BRANDS[brand].name : undefined,
      `${formatZAR(w.priceZAR)} per set of 4`,
      w.sizesAvailable,
      w.compatibleCars ? `fits ${w.compatibleCars}` : undefined,
      w.stockQuantitySets ? `${w.stockQuantitySets} set${w.stockQuantitySets === 1 ? '' : 's'} in stock` : undefined,
    ].filter(Boolean);
    return `- [${w.model}](${origin}/wheels/${w.slug}): ${facts.join('; ')}`;
  });

  const contact = [
    wa ? `- WhatsApp: ${wa}` : undefined,
    SITE.phoneDisplay ? `- Phone: ${SITE.phoneDisplay}` : undefined,
    SITE.tradeEmail ? `- Email: ${SITE.tradeEmail}` : undefined,
    SITE.addressLine ? `- Address: ${readableAddress(SITE.addressLine)}, ${SITE.country}` : undefined,
  ].filter(Boolean);

  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.name} supplies forged alloy wheel sets for BMW M cars in ${SITE.country}. ` +
      'This file lists every set that is in stock right now, with its price in South African Rand.',
    '',
    `- ${wheels.length} listings, ${sets} sets in stock, ${formatZAR(Math.min(...prices))} to ${formatZAR(Math.max(...prices))} per set of 4.`,
    '- Each listing is one design in one colour that is in stock now.',
    `- Two brands: FSA designs are ${WHEEL_BRANDS['forged-sa'].name}, the shop's own; FF designs are ${WHEEL_BRANDS.sixnine.name}, which the shop sells as an official dealer.`,
    `- Other colours of each design can be ordered. A lead time of ${TO_ORDER_LEAD_TIME} applies to those.`,
    '- There is no online checkout. Customers enquire on WhatsApp or by phone, and the shop confirms fitment for the car.',
    '- Prices and stock change. Confirm both with the shop before relying on them.',
    '',
    '## Wheels in stock',
    '',
    ...wheelLines,
    '',
    '## Contact',
    '',
    ...contact,
    '',
    '## Pages',
    '',
    `- [Wheels in stock](${origin}/): the full catalogue with photos and a 3D viewer`,
    `- [Installs](${origin}/installs): ${CLIENT_FITMENTS.length} customer cars we have fitted`,
    `- [Forged SA wheels](${origin}/forged-sa-wheels): the shop's own brand, and the forged ${forgedSaDesigns} sets in stock`,
    `- [Sixnine Wheels dealer](${origin}/sixnine-wheels): what Sixnine Wheels is, and the forged Sixnine ${sixnineDesigns} sets in stock`,
    // One line per Sixnine series page: the sizes Sixnine lists, from src/data/sixnineRange.json.
    ...SIXNINE_SERIES.map((series) => {
      const facts = seriesFacts(series);
      return `  - [Sixnine ${series.code}](${origin}${seriesPath(series)}): ${facts.sizeCount} ${facts.sizeCount === 1 ? 'size' : 'sizes'} as Sixnine lists them, ${diameterRange(facts)}, ${facts.boltPatterns.join(', ')}`;
    }),
    `- [Contact](${origin}/contact): WhatsApp, phone and address`,
    '',
    '## Guides',
    '',
    `- [Blog](${origin}/blog): ${BLOG_POSTS.length} plain-English guides on forged wheels for BMW M cars, in ${BLOG_PILLARS.length} topics`,
    ...BLOG_PILLARS.flatMap((pillar) => [
      `- [${pillar.name}](${origin}${blogPillarPath(pillar)}): ${pillar.description}`,
      ...postsInPillar(pillar.id).map((post) => `  - [${post.title}](${origin}${blogPostPath(post)}): ${post.description}`),
    ]),
    '',
    '## Optional',
    '',
    `- [Privacy notice](${origin}/privacy-policy)`,
    `- [Sitemap](${origin}/sitemap.xml)`,
    '',
  ].join('\n');
}
