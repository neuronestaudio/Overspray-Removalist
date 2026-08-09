import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pushGtmEvent } from '../lib/gtm';
import { createSubmissionId, getStoredAttribution } from '../lib/attribution';
import { BUSINESS, GHL_WEBHOOK, REQUEST_TIMEOUT_MS } from '../lib/site';
import {
  CONTAMINANTS,
  LOCATION_TYPES,
  COVERAGE,
  WHEN_HAPPENED,
  HANDLED_BY,
  STEPS,
  type Choice,
} from '../data/quoteSteps';

const LAST_STEP = STEPS.length - 1;
const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
/** Job photos come off a phone at 4000px; 1600 identifies fallout fine. */
const PHOTO_MAX_EDGE = 1600;

type Errors = Record<string, string>;

export default function QuoteForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [contaminant, setContaminant] = useState('');
  const [locationType, setLocationType] = useState('');
  const [location, setLocation] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicles, setVehicles] = useState('1');
  const [coverage, setCoverage] = useState('');
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
    if (s === 0 && !contaminant) e.contaminant = 'Pick what landed on it, or "Not sure yet".';
    if (s === 1) {
      if (!locationType) e.locationType = 'Let us know where the work happens.';
      if (!location.trim()) e.location = 'A suburb is enough.';
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

  function goNext() {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitError('');
    setStep((s) => Math.min(LAST_STEP, s + 1));
  }

  function goBack() {
    setErrors({});
    setSubmitError('');
    setStep((s) => Math.max(0, s - 1));
  }

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
      setSubmitError('This form is not connected yet. Set GHL_WEBHOOK in src/lib/site.ts before going live.');
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
      contaminant,
      contaminantLabel: labelFor(CONTAMINANTS, contaminant),
      locationType,
      locationTypeLabel: labelFor(LOCATION_TYPES, locationType),
      location: location.trim(),
      vehicle: vehicle.trim(),
      vehicles: vehicles.trim() || '1',
      coverage,
      coverageLabel: labelFor(COVERAGE, coverage),
      whenHappened,
      whenHappenedLabel: labelFor(WHEN_HAPPENED, whenHappened),
      handledBy,
      handledByLabel: labelFor(HANDLED_BY, handledBy),
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
      <ol className="wiz-steps">
        {STEPS.map((label, i) => (
          <li key={label} data-state={i === step ? 'current' : i < step ? 'done' : 'todo'}>
            <span className="wiz-num">{i < step ? '✓' : i + 1}</span>
            <span className="wiz-label">{label}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Panel
          title="What landed on it?"
          sub="Pick the closest. If none of them fit, choose “Not sure yet” and send photos."
        >
          <Cards options={CONTAMINANTS} value={contaminant} onChange={setContaminant} name="contaminant" />
          <Err msg={errors.contaminant} />
        </Panel>
      )}

      {step === 1 && (
        <Panel title="Where is the vehicle?" sub="We work on site across all suburbs and Australia wide.">
          <Cards options={LOCATION_TYPES} value={locationType} onChange={setLocationType} name="locationType" />
          <Err msg={errors.locationType} />
          <div className="field" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="q-location">
              Suburb or site address <span aria-hidden="true">*</span>
            </label>
            <input
              id="q-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoComplete="address-level2"
              placeholder="e.g. Epping VIC, or the site address"
              aria-invalid={errors.location ? true : undefined}
            />
            <Err msg={errors.location} />
          </div>
        </Panel>
      )}

      {step === 2 && (
        <Panel title="Tell us about the vehicle" sub="Rough answers are fine. Photos settle the rest.">
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

          <p className="wiz-legend">How much of it is covered?</p>
          <Cards options={COVERAGE} value={coverage} onChange={setCoverage} name="coverage" compact />

          <p className="wiz-legend">When did it happen?</p>
          <Cards options={WHEN_HAPPENED} value={whenHappened} onChange={setWhenHappened} name="whenHappened" compact />
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
        <Panel title="Where do we send the price?" sub="We will come back with a number, or a time to come and look.">
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
              Anything else? <span className="hint">optional</span>
            </label>
            <textarea
              id="q-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Whether it can be worked on where it sits, access, deadlines, anything the photos do not show."
            />
          </div>
        </Panel>
      )}

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
            {loading ? 'Sending…' : 'Get my price'}
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
