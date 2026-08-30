import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pushGtmEvent } from '../lib/gtm';
import { createSubmissionId, getStoredAttribution } from '../lib/attribution';
import { BUSINESS, GHL_WEBHOOK, REQUEST_TIMEOUT_MS } from '../lib/site';
import {
  CONTAMINANTS,
  WHEN_HAPPENED,
  HANDLED_BY,
  HANDLED_BY_FROM_JOB,
  STEPS,
  type Choice,
} from '../data/quoteSteps';

const LAST_STEP = STEPS.length - 1;
const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
/** Job photos come off a phone at 4000px; 1600 identifies fallout fine. */
const PHOTO_MAX_EDGE = 1600;

type Errors = Record<string, string>;

/* Long enough to register the tick, short enough not to feel like a wait.
   420ms plus a 420ms panel animation read as a full second of nothing
   happening after a click. The tick is visible by 150. */
const AUTO_ADVANCE_MS = 150;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function QuoteForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  /** Which way the next panel should travel in from. */
  const [dir, setDir] = useState<1 | -1>(1);

  const shellRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const lastHeight = useRef(0);
  const autoTimer = useRef<number | undefined>(undefined);

  const [contaminant, setContaminant] = useState('');
  const [location, setLocation] = useState('');
  const [postcode, setPostcode] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicles, setVehicles] = useState('1');
  const [whenHappened, setWhenHappened] = useState('');
  const [handledBy, setHandledBy] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);
  const dropRef = useRef<HTMLInputElement>(null);

  function validateStep(s: number): Errors {
    const e: Errors = {};
    if (s === 0 && !contaminant) e.contaminant = 'Pick what you need, or "Not sure yet".';
    if (s === 1 && !whenHappened) e.whenHappened = 'Roughly how long has it been on there?';
    if (s === 2) {
      if (!location.trim()) e.location = 'Which suburb is the vehicle in?';
      if (!postcode.trim()) e.postcode = 'Postcode too, please.';
      else if (!/^\d{4}$/.test(postcode.trim())) e.postcode = 'An Australian postcode is four digits.';
    }
    if (s === 4) {
      if (!name.trim()) e.name = 'Please tell us your name.';
      if (!mobile.trim()) e.mobile = 'We need a number to call you back on.';
      else if (mobile.replace(/\D/g, '').length < 8) e.mobile = 'Enter a valid mobile number.';
      if (!email.trim()) e.email = 'Please give us an email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.';
    }
    return e;
  }

  /** Single entry point so direction and the pending auto-advance stay in sync. */
  function goTo(next: number) {
    window.clearTimeout(autoTimer.current);
    const target = Math.max(0, Math.min(LAST_STEP, next));
    if (target === step) return;
    setDir(target > step ? 1 : -1);
    setErrors({});
    setSubmitError('');
    setStep(target);
  }

  function goNext() {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    goTo(step + 1);
  }

  function goBack() {
    goTo(step - 1);
  }

  /* Step one asks a single question with one answer, so advancing on the pick
     removes a click from the step most likely to be abandoned. */
  function pickContaminant(value: string) {
    setContaminant(value);
    /* Insurance and fleet are answers to step five, not step one. Carrying the
       value across means nobody is asked the same thing twice. */
    const carried = HANDLED_BY_FROM_JOB[value];
    if (carried) setHandledBy(carried);
    setErrors({});
    advance(1);
  }

  function advance(to: number) {
    window.clearTimeout(autoTimer.current);
    if (prefersReducedMotion()) {
      goTo(to);
      return;
    }
    autoTimer.current = window.setTimeout(() => goTo(to), AUTO_ADVANCE_MS);
  }

  /* Step two asks one question with one answer, same as step one, so it moves
     on by itself rather than making someone reach for Continue. */
  function pickWhen(value: string) {
    setWhenHappened(value);
    setErrors({});
    advance(2);
  }

  useEffect(() => () => window.clearTimeout(autoTimer.current), []);

  /* The panels differ in height by hundreds of pixels, so swapping one for the
     next snapped the Continue button up or down the page. Measure, pin the old
     height, then let CSS run the box to the new one. Height is released
     afterwards so in-step growth (an error line, a photo thumbnail) is free. */
  useLayoutEffect(() => {
    const shell = shellRef.current;
    const body = bodyRef.current;
    if (!shell || !body) return;

    const next = body.offsetHeight;
    const prev = lastHeight.current;
    lastHeight.current = next;

    if (!prev || prev === next || prefersReducedMotion()) return;

    shell.style.height = `${prev}px`;
    shell.style.overflow = 'hidden';
    void shell.offsetHeight; // flush, or the browser coalesces both writes
    shell.style.height = `${next}px`;

    const release = (ev: TransitionEvent) => {
      if (ev.propertyName !== 'height') return;
      shell.style.height = '';
      shell.style.overflow = '';
      shell.removeEventListener('transitionend', release);
    };
    shell.addEventListener('transitionend', release);
    return () => {
      shell.removeEventListener('transitionend', release);
      shell.style.height = '';
      shell.style.overflow = '';
    };
  }, [step]);

  /* On a phone the panel that just mounted can start below the fold. Pull the
     progress rail back to the top so the next question is the first thing seen. */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const head = headRef.current;
    if (!head) return;
    const top = head.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.4) {
      window.scrollTo({
        top: window.scrollY + top - 96,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [step]);

  /* Enter inside any text input fires the form's onSubmit. Without this a
     stepped form posts an empty payload from step 1. Continue / Back are
     type="button"; this is the other half of that guard. */
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const el = e.target as HTMLElement;
    if (el.tagName === 'TEXTAREA') return;
    if (step !== LAST_STEP) {
      e.preventDefault();
      goNext();
    }
  }

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const f of Array.from(list)) {
      if (photos.length + accepted.length >= MAX_PHOTOS) rejected.push(`${f.name} (limit ${MAX_PHOTOS})`);
      else if (!f.type.startsWith('image/')) rejected.push(`${f.name} (not an image)`);
      else if (f.size > MAX_PHOTO_BYTES) rejected.push(`${f.name} (over 10MB)`);
      else accepted.push(f);
    }
    if (accepted.length) setPhotos((p) => [...p, ...accepted]);
    setSubmitError(rejected.length ? `Skipped: ${rejected.join(', ')}` : '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== LAST_STEP) {
      goNext();
      return;
    }
    if (inFlight.current) return;

    // Validate every step, not just this one, then jump back to the first bad one.
    for (let s = 0; s <= LAST_STEP; s++) {
      const errs = validateStep(s);
      if (Object.keys(errs).length) {
        setErrors(errs);
        setStep(s);
        return;
      }
    }
    setErrors({});
    setSubmitError('');

    if (GHL_WEBHOOK === 'REPLACE_ME') {
      /* Refuses loudly rather than posting nowhere. Shipping with a placeholder
         would drop every lead silently, which is the exact failure this site is
         being rebuilt to fix. */
      /* Client-safe wording. This is visible on a demo link, so it must not
         read like a stack trace; the developer-facing note lives in the comment
         on GHL_WEBHOOK and in the README, not on the customer's screen. */
      setSubmitError(
        `Online quotes are not switched on yet. Please call ${BUSINESS.phone} ` +
          `or email ${BUSINESS.email} and we will come straight back to you.`,
      );
      return;
    }

    inFlight.current = true;
    setLoading(true);

    const page = window.location.pathname;
    const attribution = getStoredAttribution();
    const submissionId = createSubmissionId();

    const payload = {
      name: name.trim(),
      phone: mobile.trim(),
      email: email.trim(),
      /* snake_case, because GoHighLevel derives a custom field's key by
         slugifying its name: a field called "Contaminant Label" is
         contact.contaminant_label. camelCase keys here would arrive with
         nothing to map to and sit in the payload unread. */
      contaminant,
      contaminant_label: labelFor(CONTAMINANTS, contaminant),
      location: location.trim(),
      postcode: postcode.trim(),
      vehicle: vehicle.trim(),
      vehicles: vehicles.trim() || '1',
      when_happened: whenHappened,
      when_happened_label: labelFor(WHEN_HAPPENED, whenHappened),
      handled_by: handledBy,
      handled_by_label: labelFor(HANDLED_BY, handledBy),
      notes: notes.trim(),
      photo_count: String(photos.length),
      source: 'Website Quote Form',
      page,
      ...attribution,
      submission_id: submissionId,
    };

    /* Field state is untouched on every failure path, so the visitor keeps
       everything they typed and can just press the button again. */
    const failWithRetry = () => {
      setSubmitError(
        `We couldn't send that just now, and your details are still here. ` +
          `Please press the button again, or call ${BUSINESS.phone}.`,
      );
      inFlight.current = false;
      setLoading(false);
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(GHL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) {
        failWithRetry();
        return;
      }

      /* The CRM has the lead, so the conversion is real. Never fire these on a
         failed submit: an uncaptured lead is not a conversion, and counting it
         as one corrupts every decision made about ad spend afterwards. */
      pushGtmEvent('quote_form_submit', {
        form_name: 'get_a_quote',
        service_context: contaminant || 'general',
        handled_by: handledBy || 'unspecified',
        vehicle_count: Number(vehicles) || 1,
        photo_count: photos.length,
        page_path: page,
        page_title: document.title,
      });
      pushGtmEvent('generate_lead', { currency: 'AUD', value: 0 });

      /* Photos go separately and only once the lead is safe. They are what turn
         a phone estimate into an accurate quote, but they are not worth risking
         the lead for, so this is fire-and-forget. */
      if (photos.length) void sendPhotos(photos, submissionId, payload);

      /* inFlight stays latched and loading stays set: the component is about to
         unmount, and leaving them set is what guarantees the events above fire
         exactly once. */
      navigate('/thank-you', { state: { fromSubmit: true } });
    } catch {
      failWithRetry();
    } finally {
      clearTimeout(timer);
    }
  }

  return (
    <form className="wiz" onSubmit={handleSubmit} onKeyDown={onKeyDown} noValidate aria-label="Get a quote">
      <div className="wiz-head" ref={headRef}>
        {/* One continuous track with a fill that slides, rather than five
            independent border-tops flicking between two colours. */}
        <ol
          className="wiz-steps"
          style={{ '--wiz-fill': `${(step / LAST_STEP) * 100}%` } as React.CSSProperties}
        >
          {STEPS.map((label, i) => (
            <li key={label} data-state={i === step ? 'current' : i < step ? 'done' : 'todo'}>
              <span className="wiz-num">{i < step ? '✓' : i + 1}</span>
              <span className="wiz-label">{label}</span>
            </li>
          ))}
        </ol>
        <p className="wiz-read" aria-live="polite">
          <span>
            Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}
          </span>
          {/* Questions remaining, not "0% complete" — which is what a
              percentage reads as on the step nobody has finished yet. */}
          <span className="wiz-pct">
            {step === LAST_STEP ? 'Last step' : `${LAST_STEP - step} to go`}
          </span>
        </p>
      </div>

      <div className="wiz-shell" ref={shellRef}>
        <div className="wiz-body" ref={bodyRef} key={step} data-dir={dir === 1 ? 'fwd' : 'back'}>

      {step === 0 && (
        <Panel
          title="What do you need?"
          sub="Pick the closest. If none of them fit, choose “Not sure yet” and send photos."
        >
          <Cards options={CONTAMINANTS} value={contaminant} onChange={pickContaminant} name="contaminant" />
          <Err msg={errors.contaminant} />
        </Panel>
      )}

      {step === 1 && (
        <Panel
          title="When did it happen?"
          sub="Fresh contamination lifts more easily than contamination that has had months to bond."
        >
          <Cards
            options={WHEN_HAPPENED}
            value={whenHappened}
            onChange={pickWhen}
            name="whenHappened"
          />
          <Err msg={errors.whenHappened} />
        </Panel>
      )}

      {step === 2 && (
        <Panel
          title="The vehicle, and where it is"
          sub="Rough answers are fine. The photos settle the rest."
        >
          <div className="wiz-row">
            <div className="field">
              <label htmlFor="q-vehicle">
                Vehicle <span className="hint">Make and model</span>
              </label>
              <input
                id="q-vehicle"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g. Toyota Hilux, white"
              />
            </div>
            <div className="field">
              <label htmlFor="q-vehicles">How many vehicles affected</label>
              <input
                id="q-vehicles"
                type="number"
                min="1"
                step="1"
                value={vehicles}
                onChange={(e) => setVehicles(e.target.value)}
              />
              <p className="hint">
                If a whole lot is affected in one place, we price the lot rather than each car.
              </p>
            </div>
          </div>

          <div className="wiz-row">
            <div className="field">
              <label htmlFor="q-location">
                Suburb <span aria-hidden="true">*</span>
              </label>
              <input
                id="q-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="address-level2"
                placeholder="e.g. Epping"
                aria-invalid={errors.location ? true : undefined}
              />
              <Err msg={errors.location} />
            </div>
            <div className="field">
              <label htmlFor="q-postcode">
                Postcode <span aria-hidden="true">*</span>
              </label>
              <input
                id="q-postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={4}
                placeholder="3076"
                aria-invalid={errors.postcode ? true : undefined}
              />
              <Err msg={errors.postcode} />
            </div>
          </div>
        </Panel>
      )}

      {step === 3 && (
        <Panel
          title="Photos of the damage"
          sub="This is the single thing that turns a phone estimate into a real price. Daylight shots of the affected panels tell us the most."
        >
          <div
            className="drop"
            tabIndex={0}
            role="button"
            aria-label="Add photos. Click to browse, or drag images here."
            onClick={() => dropRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropRef.current?.click();
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addPhotos(e.dataTransfer?.files ?? null);
            }}
          >
            <p className="drop-title">Drag photos here, or click to browse</p>
            <p className="drop-sub">Up to {MAX_PHOTOS} images, 10MB each</p>
            <input
              ref={dropRef}
              id="q-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {photos.length > 0 && (
            <ul className="wiz-thumbs" aria-live="polite">
              {photos.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <span>{f.name}</span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setPhotos((p) => p.filter((_, n) => n !== i))}>
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="wiz-legend">Who is handling it?</p>
          <Cards options={HANDLED_BY} value={handledBy} onChange={setHandledBy} name="handledBy" compact />
        </Panel>
      )}

      {step === 4 && (
        <Panel title="Where do we send the quote?" sub="We come back with a number, or a time to look at it.">
          <div className="wiz-row">
            <div className="field">
              <label htmlFor="q-name">
                Name <span aria-hidden="true">*</span>
              </label>
              <input id="q-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={errors.name ? true : undefined} />
              <Err msg={errors.name} />
            </div>
            <div className="field">
              <label htmlFor="q-mobile">
                Mobile <span aria-hidden="true">*</span>
              </label>
              <input id="q-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} autoComplete="tel" aria-invalid={errors.mobile ? true : undefined} />
              <Err msg={errors.mobile} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="q-email">
              Email <span aria-hidden="true">*</span>
            </label>
            <input id="q-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={errors.email ? true : undefined} />
            <Err msg={errors.email} />
          </div>
          <div className="field">
            <label htmlFor="q-notes">
              Any comments / Special Requests <span className="hint">optional</span>
            </label>
            <textarea
              id="q-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Access, deadlines, how many vehicles, anything the photos do not show."
            />
          </div>
        </Panel>
      )}

        </div>
      </div>

      <div className="wiz-nav">
        {step > 0 ? (
          <button className="btn btn-ghost" type="button" onClick={goBack}>
            Back
          </button>
        ) : (
          <span />
        )}

        {step < LAST_STEP ? (
          <button className="btn btn-primary" type="button" onClick={goNext}>
            Continue
          </button>
        ) : (
          <button className="btn btn-primary" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? 'Sending…' : 'Get my quote'}
          </button>
        )}
      </div>

      {submitError && (
        <p className="form-status" data-state="error" role="alert">
          {submitError}
        </p>
      )}

      <p className="form-note">
        We use your details to quote this job and nothing else. Prefer to talk? Call{' '}
        <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
      </p>
    </form>
  );
}

/* ---------------------------------------------------------------- pieces */

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="wiz-panel">
      <h2 className="display">{title}</h2>
      <p className="wiz-sub">{sub}</p>
      {children}
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="field-err" role="alert">
      {msg}
    </p>
  );
}

function Cards({
  options,
  value,
  onChange,
  name,
  compact,
}: {
  options: Choice[];
  value: string;
  onChange: (v: string) => void;
  name: string;
  compact?: boolean;
}) {
  return (
    <div className="wiz-cards" data-compact={compact ? 'true' : 'false'} role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className="wiz-card"
          onClick={() => onChange(o.value)}
        >
          <span className="wiz-card-label">{o.label}</span>
          <span className="wiz-card-hint">{o.hint}</span>
          <span className="wiz-tick" aria-hidden="true">
            ✓
          </span>
        </button>
      ))}
    </div>
  );
}

function labelFor(options: Choice[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '';
}

/**
 * Downscale and POST the photos, keyed by the same submission_id as the lead.
 * Separate request, after the lead is captured, never awaited by submit.
 */
async function sendPhotos(
  files: File[],
  submissionId: string,
  lead: { name: string; email: string; phone: string },
) {
  try {
    const encoded = await Promise.all(files.map(shrink));
    await fetch('/api/quote-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_id: submissionId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        photos: encoded.filter(Boolean),
      }),
    });
  } catch {
    /* The lead is already captured. Photos can be chased by reply. */
  }
}

function shrink(file: File): Promise<{ name: string; data: string } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width: w, height: h } = img;
      if (w > PHOTO_MAX_EDGE || h > PHOTO_MAX_EDGE) {
        const scale = Math.min(PHOTO_MAX_EDGE / w, PHOTO_MAX_EDGE / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      resolve({
        name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
        data: canvas.toDataURL('image/jpeg', 0.82).split(',')[1],
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
