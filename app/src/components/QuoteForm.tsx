import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pushGtmEvent } from '../lib/gtm';
import { createSubmissionId, getStoredAttribution } from '../lib/attribution';
import { BUSINESS, GHL_WEBHOOK, REQUEST_TIMEOUT_MS } from '../lib/site';
import { SERVICES } from '../data/services';

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
/** Job photos come off a phone at 4000px; 1600 is plenty to identify fallout. */
const PHOTO_MAX_EDGE = 1600;

interface Errors {
  [field: string]: string;
}

export default function QuoteForm() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [vehicles, setVehicles] = useState('1');
  const [vehicle, setVehicle] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Please tell us your name.';
    if (!phone.trim()) e.phone = 'Please give us a contact number.';
    else if (phone.replace(/\D/g, '').length < 8) e.phone = 'Enter a valid contact number.';
    if (!email.trim()) e.email = 'Please give us an email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Enter a valid email address.';
    if (!message.trim()) e.message = 'Tell us what landed on the vehicle.';
    return e;
  }

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const f of Array.from(list)) {
      if (photos.length + accepted.length >= MAX_PHOTOS) {
        rejected.push(`${f.name} (limit ${MAX_PHOTOS})`);
      } else if (!f.type.startsWith('image/')) {
        rejected.push(`${f.name} (not an image)`);
      } else if (f.size > MAX_PHOTO_BYTES) {
        rejected.push(`${f.name} (over 10MB)`);
      } else {
        accepted.push(f);
      }
    }
    if (accepted.length) setPhotos((prev) => [...prev, ...accepted]);
    setSubmitError(rejected.length ? `Skipped: ${rejected.join(', ')}` : '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setSubmitError('Please correct the highlighted fields.');
      return;
    }
    setErrors({});
    setSubmitError('');

    if (GHL_WEBHOOK === 'REPLACE_ME') {
      /* Refuses rather than posting nowhere, and refuses loudly. Shipping with
         a placeholder would drop every lead silently, which is the exact
         failure this site is being rebuilt to fix. */
      setSubmitError(
        'This form is not connected yet. Set GHL_WEBHOOK in src/lib/site.ts before going live.',
      );
      return;
    }

    inFlight.current = true;
    setLoading(true);

    const page = window.location.pathname;
    /* Never throws, returns empty strings when storage is unavailable, so a
       blocked localStorage cannot stop a lead being captured. */
    const attribution = getStoredAttribution();
    const submissionId = createSubmissionId();

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      service: service || 'Not specified',
      serviceLabel: SERVICES.find((s) => s.slug === service)?.nav ?? 'Not specified',
      location: location.trim(),
      vehicles: vehicles.trim() || '1',
      vehicle: vehicle.trim(),
      message: message.trim(),
      photo_count: String(photos.length),
      source: 'Website Quote Form',
      page,
      ...attribution,
      submission_id: submissionId,
    };

    /* Field state is deliberately untouched on every failure path, so the
       visitor keeps what they typed and can press the button again. */
    const failWithRetry = () => {
      setSubmitError(
        `We couldn't send that just now, and your details are still here. ` +
          `Please press the button again, or call ${BUSINESS.phone}.`,
      );
      inFlight.current = false;
      setLoading(false);
    };

    // AbortController rather than AbortSignal.timeout, for wider browser support.
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
        service_context: service || 'general',
        photo_count: photos.length,
        page_path: page,
        page_title: document.title,
      });
      pushGtmEvent('generate_lead', { currency: 'AUD', value: 0 });

      /* Photos go separately and only once the lead is safe. They are the
         difference between a phone estimate and an accurate quote, but they are
         not worth risking the lead for: this is fire-and-forget and its failure
         never blocks the navigation below. */
      if (photos.length) void sendPhotos(photos, submissionId, payload);

      /* inFlight stays latched and loading stays set. The component is about to
         unmount, and leaving them set is what guarantees the events above fire
         exactly once. */
      navigate('/thank-you', { state: { fromSubmit: true } });
    } catch {
      failWithRetry();
    } finally {
      clearTimeout(timer);
    }
  }

  const field = (key: string) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${key}-err` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Get a quote">
      <div className="field">
        <label htmlFor="q-name">
          Your name <span aria-hidden="true">*</span>
        </label>
        <input
          id="q-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          {...field('name')}
        />
        {errors.name && (
          <p className="field-err" id="name-err" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="q-phone">
          Contact number <span aria-hidden="true">*</span>
        </label>
        <input
          id="q-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          {...field('phone')}
        />
        {errors.phone && (
          <p className="field-err" id="phone-err" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="q-email">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="q-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...field('email')}
        />
        {errors.email && (
          <p className="field-err" id="email-err" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="q-service">What happened</label>
        <select
          id="q-service"
          name="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">Not sure yet</option>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.nav}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="q-location">
          Where is the vehicle <span className="hint">Suburb is enough</span>
        </label>
        <input
          id="q-location"
          name="location"
          autoComplete="address-level2"
          placeholder="Suburb, or the site address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="q-vehicles">How many vehicles affected</label>
        <input
          id="q-vehicles"
          name="vehicles"
          type="number"
          min="1"
          step="1"
          value={vehicles}
          onChange={(e) => setVehicles(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="q-vehicle">
          Vehicle <span className="hint">Make and model</span>
        </label>
        <input
          id="q-vehicle"
          name="vehicle"
          placeholder="e.g. Toyota Hilux, white"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="q-message">
          Tell us about it <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="q-message"
          name="message"
          placeholder="What landed on it, roughly when, and whether it can be worked on where it sits."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          {...field('message')}
        />
        {errors.message && (
          <p className="field-err" id="message-err" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="q-photos">
          Photos of the damage <span className="hint">Up to {MAX_PHOTOS}, 10MB each</span>
        </label>
        <input
          id="q-photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = '';
          }}
        />
        {photos.length > 0 && (
          <ul className="thumbs" aria-live="polite">
            {photos.map((f, i) => (
              <li key={`${f.name}-${i}`}>
                {f.name}{' '}
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setPhotos((prev) => prev.filter((_, n) => n !== i))}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Sending…' : 'Send my quote request'}
      </button>

      {submitError && (
        <p className="form-status" data-state="error" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}

/**
 * Downscale and POST the photos, keyed by the same submission_id as the lead.
 * Separate request, after the lead is captured, and never awaited by the
 * submit path.
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
