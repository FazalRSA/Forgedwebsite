/**
 * Builds /llms.txt (https://llmstxt.org): a plain Markdown summary of the business for AI
 * assistants, which cannot run this single-page app. Everything comes from the catalogue, the
 * installs list and SITE, so it cannot drift from the pages or state anything they do not.
 */
import { formatZAR, getAllBrandWheels, isSixnineWheel, TO_ORDER_LEAD_TIME } from '../data/catalogue';
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
  // "FF-1 and FF-3": the Sixnine designs in stock, read from the catalogue.
  const sixnineCodes = Array.from(new Set(wheels.filter(isSixnineWheel).map((w) => w.modelCode)));
  const sixnineDesigns =
    sixnineCodes.length > 1
      ? `${sixnineCodes.slice(0, -1).join(', ')} and ${sixnineCodes[sixnineCodes.length - 1]}`
      : sixnineCodes[0] ?? 'FF';

  const wheelLines = wheels.map((w) => {
    const facts = [
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
    `- [Sixnine Wheels dealer](${origin}/sixnine-wheels): what Sixnine Wheels is, and the forged Sixnine ${sixnineDesigns} sets in stock`,
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
