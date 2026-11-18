import type { BrandWheelItem } from '../data/catalogue';
import { formatSizes } from './designCards';

/** "FF-1", "FF-1 and FF-3", "FF-1, FF-2 and FF-3". */
export function joinList(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? '';
}

/** The design codes among some listings, each once, in natural order: FSA001 before FSA002, FF-1 before FF-3. */
export function designCodes(wheels: Pick<BrandWheelItem, 'modelCode'>[]): string[] {
  return Array.from(new Set(wheels.map((wheel) => wheel.modelCode).filter((code): code is string => Boolean(code)))).sort(
    (a, b) => a.localeCompare(b, 'en', { numeric: true })
  );
}

/** The one value every row agrees on, or null when the rows differ or have none. */
function sharedValue(values: (string | undefined)[]): string | null {
  const unique = Array.from(new Set(values.filter((value): value is string => Boolean(value))));
  return unique.length === 1 ? unique[0] : null;
}

/** Picks one part out of "PCD 5×112 · ET15/20 · CB66.6", e.g. the part that starts with "PCD". */
function specPart(spec: string | undefined, prefix: string): string | undefined {
  return spec?.split('·').map((part) => part.trim()).find((part) => part.startsWith(prefix));
}

export interface FitmentRow {
  label: string;
  value: string;
}

/**
 * The fitment facts a brand page shows for its sets in stock: the cars they fit, and the wheel sizes,
 * bolt pattern and centre bore where every set agrees. A fact the sets disagree on is left out rather
 * than papered over (offsets always differ, so they stay on each wheel page).
 */
export function fitmentAtAGlance(wheels: BrandWheelItem[]): FitmentRow[] {
  const rows: FitmentRow[] = [];
  const cars = Array.from(new Set(wheels.map((wheel) => wheel.compatibleCars).filter(Boolean)));
  if (cars.length > 0) rows.push({ label: 'Fits', value: cars.join(', ') });
  const sizes = sharedValue(wheels.map((wheel) => formatSizes(wheel.sizesAvailable) || undefined));
  if (sizes) rows.push({ label: 'Wheel sizes', value: sizes });
  const pcd = sharedValue(wheels.map((wheel) => specPart(wheel.technicalSpecSheet, 'PCD')));
  if (pcd) rows.push({ label: 'Bolt pattern', value: pcd.replace(/^PCD\s*/, '') });
  const bore = sharedValue(wheels.map((wheel) => specPart(wheel.technicalSpecSheet, 'CB')));
  if (bore) rows.push({ label: 'Centre bore', value: `${bore.replace(/^CB\s*/, '')} mm` });
  return rows;
}
