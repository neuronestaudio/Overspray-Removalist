/**
 * First-touch advertising attribution, captured once per page load and sent
 * with the lead so the CRM can tie an enquiry back to the campaign that paid
 * for it.
 *
 * First-touch, not last-touch: the record is written on the first visit and
 * thereafter only *gap-filled*. A field that already holds a value is never
 * overwritten, and `first_landing_page` is never replaced at all. A later visit
 * on an untagged URL therefore cannot erase what an earlier tagged visit
 * recorded — which is the usual way naive implementations lose attribution.
 *
 * Everything here is best-effort. Private browsing, disabled storage, quota
 * limits and malformed URLs all resolve to empty strings rather than throwing:
 * losing attribution is an inconvenience, losing the lead is not acceptable.
 */

const STORAGE_KEY = 'overspray_attribution';

/**
 * The URL-derived fields, in the order they are sent to the CRM.
 *
 * The click IDs are all four the ad platforms currently issue, not just the one
 * whose channel happens to be running today. They cost an empty string each
 * while a channel is dormant, and capturing one late is not recoverable: a
 * visitor who lands before the field exists already has a record, so gap-fill
 * will never backfill them. `gclid` in particular is what makes an offline
 * conversion import back into Google Ads possible at all.
 *
 * `gbraid` / `wbraid` are the iOS privacy-era replacements Google sends instead
 * of `gclid` (app-to-web and web-to-web respectively) — a campaign can return
 * all three across different visitors.
 */
const PARAM_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
] as const;

type ParamField = (typeof PARAM_FIELDS)[number];

export type AttributionRecord = Record<ParamField, string> & {
  /** Full URL of the first page seen, query string included. */
  first_landing_page: string;
};

function emptyRecord(): AttributionRecord {
  return {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    gclid: '',
    gbraid: '',
    wbraid: '',
    fbclid: '',
    msclkid: '',
    first_landing_page: '',
  };
}

const isBrowser = () => typeof window !== 'undefined';

/**
 * Coerce anything read out of storage into a known-good shape.
 *
 * Starting from `emptyRecord()` and copying only the fields actually present is
 * also what makes adding a field safe: a record written by an earlier, shorter
 * version of PARAM_FIELDS loads with the new fields empty, which leaves them
 * eligible for gap-fill on the visitor's next tagged visit rather than stuck.
 */
function normalise(value: unknown): AttributionRecord {
  const record = emptyRecord();
  if (!value || typeof value !== 'object') return record;
  const raw = value as Record<string, unknown>;
  for (const field of PARAM_FIELDS) {
    if (typeof raw[field] === 'string') record[field] = raw[field] as string;
  }
  if (typeof raw.first_landing_page === 'string') {
    record.first_landing_page = raw.first_landing_page;
  }
  return record;
}

function read(): AttributionRecord | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalise(JSON.parse(raw));
  } catch {
    return null;
  }
}

function write(record: AttributionRecord): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable or full — proceed without persisting */
  }
}

/**
 * Read attribution parameters from the current URL and persist them.
 *
 * Call once at application startup only. It deliberately does not run on SPA
 * route changes: an internal navigation carries no campaign parameters, and
 * re-running it there is how first-touch data gets clobbered.
 */
export function captureAttribution(): void {
  if (!isBrowser()) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const incoming = emptyRecord();
    for (const field of PARAM_FIELDS) {
      incoming[field] = params.get(field) ?? '';
    }
    incoming.first_landing_page = window.location.href;

    const existing = read();

    // No record yet: this visit is the first touch.
    if (!existing) {
      write(incoming);
      return;
    }

    // Gap-fill only. Existing non-empty values win, always.
    const merged = { ...existing };
    for (const field of PARAM_FIELDS) {
      if (!merged[field] && incoming[field]) merged[field] = incoming[field];
    }
    if (!merged.first_landing_page) {
      merged.first_landing_page = incoming.first_landing_page;
    }
    write(merged);
  } catch {
    /* malformed URL or blocked storage — attribution is simply not recorded */
  }
}

/**
 * The stored attribution record, or a record of empty strings if there is none.
 * Never throws and never returns undefined fields, so the caller can spread it
 * into a payload without guarding.
 */
export function getStoredAttribution(): AttributionRecord {
  return read() ?? emptyRecord();
}

/**
 * Opaque identifier for a single submission attempt. Random and not derived
 * from anything the visitor entered, so it is safe to store and log.
 * `crypto.randomUUID` needs a secure context; the fallback covers plain-http
 * development hosts and older browsers.
 */
export function createSubmissionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to the non-crypto fallback */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
