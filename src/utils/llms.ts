/**
 * Builds /llms.txt (https://llmstxt.org): a plain Markdown summary of the business for AI
 * assistants, which cannot run this single-page app. Everything comes from the catalogue, the
 * installs list and SITE, so it cannot drift from the pages or state anything they do not.
 */
import { formatZAR, getAllBrandWheels, TO_ORDER_LEAD_TIME } from '../data/catalogue';
import { CLIENT_FITMENTS } from '../data/clientFitments';
import { SITE, whatsappLink } from '../config/site';
import { SITE_ORIGIN } from './seo';

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
    `- [Installs](${origin}/installs): ${CLIENT_FITMENTS.length} customer cars fitted with our wheels`,
    `- [Sixnine Wheels dealer](${origin}/sixnine-wheels): the Sixnine FF-1 and FF-3 sets in stock`,
    `- [Contact](${origin}/contact): WhatsApp, phone and address`,
    '',
    '## Optional',
    '',
    `- [Privacy notice](${origin}/privacy-policy)`,
    `- [Sitemap](${origin}/sitemap.xml)`,
    '',
  ].join('\n');
}
