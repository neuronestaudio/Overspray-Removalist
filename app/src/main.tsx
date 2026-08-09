import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import './index.css';
import './styles/home.css';
import './styles/coverflow.css';
import './styles/wizard.css';
import App from './App';
import { initPhoneCtaTracking } from './lib/gtm';
import { captureAttribution } from './lib/attribution';

initPhoneCtaTracking();
/* Once per page load, before render. Not on route changes: an internal
   navigation carries no campaign parameters and would clobber first-touch. */
captureAttribution();

const root = document.getElementById('root')!;

/* Every route ships pre-rendered HTML, so hydrate rather than replace it.
   createRoot here would throw the server markup away on boot, which loses the
   thing the pre-render exists for. The empty check covers `npm run dev`, where
   there is no server HTML. */
if (root.hasChildNodes()) {
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
