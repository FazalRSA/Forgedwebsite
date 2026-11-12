/**
 * Lead delivery: every call to action on the site (interest request, dealer
 * application, allocation-list sign-up) posts to one n8n webhook, which logs the
 * lead to the "FORGED Website Leads" data table, emails the team and sends the
 * visitor a confirmation. See README → "Lead delivery (n8n)".
 *
 * The site never blocks on delivery: if the webhook is unreachable the form still
 * completes with a locally generated reference and tells the visitor to email the
 * business, so a lead is never silently lost on the visitor's side.
 */
import { SITE, tradeContactEmail } from '../config/site';

export type LeadType = 'interest' | 'dealer' | 'newsletter';

export interface LeadInput {
  type: LeadType;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  partNo?: string;
  finish?: string;
  vehicle?: string;
  notes?: string;
  /** Extra type-specific fields shown in the team email and stored as JSON. */
  details?: Record<string, string | string[]>;
  /** Honeypot. Real visitors never fill it; bots that do are dropped silently. */
  website?: string;
}

export interface LeadPayload extends LeadInput {
  page: string;
  submittedAt: string;
  consent: true;
  source: string;
}

export interface LeadResult {
  /** True when n8n accepted the lead (the webhook answered ok:true). */
  delivered: boolean;
  /** Reference shown to the visitor: n8n's when delivered, a local one otherwise. */
  reference: string;
  /** Visitor-facing notice when delivery failed, null when delivered. */
  message: string | null;
}

export interface SubmitLeadOptions {
  fetchImpl?: typeof fetch;
  url?: string;
  timeoutMs?: number;
  page?: string;
  now?: Date;
}

const REFERENCE_PREFIX: Record<LeadType, string> = {
  interest: 'INT',
  dealer: 'DLR',
  newsletter: 'NEWS',
};

function readViteEnv(): Record<string, string | undefined> | undefined {
  try {
    return (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  } catch {
    return undefined;
  }
}

/** VITE_LEADS_WEBHOOK_URL wins; otherwise the production URL in site config. */
export function resolveLeadsWebhookUrl(
  env: Record<string, string | undefined> | undefined = readViteEnv()
): string {
  const fromEnv = env?.VITE_LEADS_WEBHOOK_URL?.trim();
  return fromEnv || SITE.leadsWebhookUrl;
}

/** Same shape as the references n8n issues, so the visitor sees one format either way. */
export function localReference(type: LeadType, nowMs = Date.now()): string {
  return `FORGED-${REFERENCE_PREFIX[type]}-${String(nowMs).slice(-6)}`;
}

export function buildLeadPayload(input: LeadInput, page: string, now = new Date()): LeadPayload {
  return {
    ...input,
    page,
    submittedAt: now.toISOString(),
    consent: true,
    source: SITE.domain,
  };
}

export function undeliveredMessage(reference: string): string {
  return `Your request was saved on this device but could not be sent to our team right now. Please email ${tradeContactEmail()} quoting reference ${reference}.`;
}

export async function submitLead(
  input: LeadInput,
  options: SubmitLeadOptions = {}
): Promise<LeadResult> {
  const now = options.now ?? new Date();
  const page =
    options.page ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const fallback = localReference(input.type, now.getTime());

  if (input.website && input.website.trim()) {
    // Honeypot filled: behave like a success so the bot learns nothing, send nothing.
    return { delivered: true, reference: fallback, message: null };
  }

  const fetchImpl = options.fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined);
  const url = options.url ?? resolveLeadsWebhookUrl();
  if (!fetchImpl || !url) {
    return { delivered: false, reference: fallback, message: undeliveredMessage(fallback) };
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timer = controller
    ? setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000)
    : undefined;

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildLeadPayload(input, page, now)),
      signal: controller?.signal,
    });
    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; reference?: string; error?: string }
      | null;
    if (!response.ok || !data || data.ok !== true) {
      return { delivered: false, reference: fallback, message: undeliveredMessage(fallback) };
    }
    const reference =
      typeof data.reference === 'string' && data.reference.trim() ? data.reference : fallback;
    return { delivered: true, reference, message: null };
  } catch {
    return { delivered: false, reference: fallback, message: undeliveredMessage(fallback) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
