/**
 * Plain-text helpers for the wheel page and the enquiry form: reading the spec line from the stock
 * sheet and wording the enquiry. Kept free of React so they can be unit tested.
 */

export interface TechnicalSpecs {
  /** Bolt pattern, e.g. "5×112". */
  pcd?: string;
  /** Offset, e.g. "8/15". */
  et?: string;
  /** Centre bore in mm, e.g. "66.6". */
  cb?: string;
}

/**
 * Reads PCD, ET and CB from the stock sheet's spec line, e.g. "PCD 5×112 · ET8/15 · CB66.6".
 * Anything it cannot read is left out rather than guessed.
 */
export function parseTechnicalSpecSheet(sheet?: string | null): TechnicalSpecs {
  const out: TechnicalSpecs = {};
  if (!sheet) return out;
  for (const part of sheet.split(/[·|;]/)) {
    const match = /^(PCD|ET|CB)\s*(.+)$/i.exec(part.trim());
    if (!match) continue;
    const key = match[1].toLowerCase() as keyof TechnicalSpecs;
    const value = match[2].trim();
    if (value) out[key] = value;
  }
  return out;
}

/** "1 set in stock" / "2 sets in stock"; null when no stock count is known. */
export function stockLabel(sets?: number | null): string | null {
  if (!sets || sets < 1) return null;
  return `${sets} ${sets === 1 ? 'set' : 'sets'} in stock`;
}

export interface WheelEnquiryFacts {
  /** Design name, e.g. "FSA002". */
  design: string;
  /** The wheel's own finish name, e.g. "Gold". */
  finish: string;
  /** e.g. "20 inch / 21 inch". */
  sizes?: string;
  /** Already formatted, e.g. "R 75,000". */
  price: string;
}

/** "FSA002 in Gold (20 inch / 21 inch), R 75,000 per set of 4": what the enquiry is about. */
export function describeWheelForEnquiry({ design, finish, sizes, price }: WheelEnquiryFacts): string {
  const sizePart = sizes ? ` (${sizes})` : '';
  return `${design} in ${finish}${sizePart}, ${price} per set of 4`;
}

/** The message a visitor sends, for WhatsApp and for the enquiry form's prefilled text. */
export function wheelEnquiryMessage(descriptor: string): string {
  return `Hi, I'd like to ask about the ${descriptor}. Is it still available?`;
}
