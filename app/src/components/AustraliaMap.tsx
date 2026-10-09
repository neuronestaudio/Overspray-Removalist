import { Link } from 'react-router-dom';
import { CITIES, cityPath, type City } from '../data/cities';

/**
 * A drawn map of Australia with the cities the site has pages for.
 *
 * Drawn in the page rather than loaded from a map provider: it says "Australia"
 * before the visitor has read a word, and it costs no request. One colour for
 * the land in the site's own line weight, brand-red marks for the capitals,
 * smaller marks for the industrial hubs, and the Epping workshop as the home
 * mark with a slow pulse.
 *
 * The coastline is a simplified polygon (about eighty points) on a plain
 * equirectangular projection. It is a diagram, not a chart: the marks sit
 * where the cities are to within a few pixels at this size, which is all a
 * reader needs to find Perth on the left and Brisbane on the right.
 */

/* Projection: longitude 112..154 → x, latitude -9..-44 → y, 18 px per degree. */
const px = (lon: number) => Math.round((lon - 112) * 18);
const py = (lat: number) => Math.round((-9 - lat) * 18);

const MAINLAND: [number, number][] = [
  [142.5, -10.7], [145.3, -15.5], [145.8, -16.9], [146.8, -19.3], [149.2, -21.1], [150.8, -23.4],
  [151.3, -23.9], [152.4, -24.9], [153.2, -25.3], [153.1, -26.4], [153.1, -27.5], [153.6, -28.6],
  [153.1, -30.3], [152.9, -31.4], [151.8, -32.9], [151.3, -33.9], [150.9, -34.4], [150.7, -35.1],
  [149.9, -37.1], [149.9, -37.5], [148.0, -37.9], [146.4, -39.1], [145.3, -38.5], [144.6, -38.3],
  [144.95, -37.9], [144.4, -38.15], [143.5, -38.85], [142.5, -38.4], [141.6, -38.35], [140.9, -38.0],
  [139.85, -36.8], [139.0, -35.5], [138.6, -35.55], [138.1, -35.6], [138.5, -34.9], [138.0, -34.2],
  [137.6, -35.1], [138.0, -33.2], [137.8, -32.5], [137.6, -33.0], [135.9, -34.7], [134.5, -33.2],
  [133.7, -32.1], [131.0, -31.5], [128.9, -31.7], [126.0, -32.3], [121.9, -33.9], [119.5, -34.4],
  [117.9, -35.0], [115.1, -34.4], [115.6, -33.3], [115.85, -32.0], [115.0, -30.3], [114.6, -28.8],
  [113.5, -26.0], [113.4, -24.5], [114.1, -21.9], [115.1, -21.6], [116.7, -20.6], [118.6, -20.3],
  [120.5, -19.5], [122.2, -18.0], [122.9, -16.4], [124.5, -16.5], [125.3, -15.3], [126.5, -14.1],
  [126.7, -13.9], [128.0, -14.8], [129.3, -15.0], [129.8, -14.0], [130.2, -13.0], [130.85, -12.45],
  [132.3, -11.3], [133.5, -11.8], [135.3, -12.1], [136.8, -12.2], [136.4, -13.6], [135.7, -14.9],
  [136.3, -15.9], [137.9, -16.6], [139.3, -17.5], [140.8, -17.5], [141.5, -15.5], [141.6, -12.7],
  [142.2, -11.0],
];

const TASMANIA: [number, number][] = [
  [144.7, -40.7], [146.3, -41.1], [147.9, -40.9], [148.3, -41.3], [148.0, -42.5], [147.4, -43.0],
  [146.6, -43.6], [145.5, -42.5], [144.8, -41.2],
];

const toPath = (pts: [number, number][]) =>
  pts.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${px(lon)} ${py(lat)}`).join(' ') + ' Z';

const MAINLAND_D = toPath(MAINLAND);
const TASMANIA_D = toPath(TASMANIA);

/* Epping, the workshop. */
const HOME = { lon: 145.0, lat: -37.65 };

/* Where each capital's label sits relative to its mark, so none collide. */
const LABEL: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' }> = {
  sydney: { dx: 12, dy: 5, anchor: 'start' },
  brisbane: { dx: 12, dy: -2, anchor: 'start' },
  'gold-coast': { dx: 12, dy: 16, anchor: 'start' },
  perth: { dx: -12, dy: 5, anchor: 'end' },
  adelaide: { dx: -12, dy: 16, anchor: 'end' },
  canberra: { dx: -12, dy: 14, anchor: 'end' },
  hobart: { dx: 12, dy: 5, anchor: 'start' },
  darwin: { dx: -12, dy: -4, anchor: 'end' },
};

function Mark({ city }: { city: City }) {
  const x = px(city.lon);
  const y = py(city.lat);
  const label = LABEL[city.slug];
  return (
    <Link to={cityPath(city)} className="aumap-link">
      <title>{`Overspray removal ${city.name}`}</title>
      {/* A generous invisible hit area, so the marks are tappable on a phone. */}
      <circle cx={x} cy={y} r={16} fill="transparent" />
      <circle className={city.capital ? 'aumap-cap' : 'aumap-hub'} cx={x} cy={y} r={city.capital ? 6 : 3.5} />
      {label && (
        <text className="aumap-cap-l" x={x + label.dx} y={y + label.dy} textAnchor={label.anchor}>
          {city.name}
        </text>
      )}
    </Link>
  );
}

export default function AustraliaMap() {
  const hx = px(HOME.lon);
  const hy = py(HOME.lat);
  return (
    <svg
      className="aumap"
      viewBox="-20 10 900 640"
      role="img"
      aria-label="Map of Australia marking the cities The Overspray Removalist works in, with the workshop in Epping, Victoria"
    >
      <path className="aumap-land" d={MAINLAND_D} />
      <path className="aumap-land" d={TASMANIA_D} />

      {/* Hubs under capitals, so a capital's label never sits beneath a hub mark. */}
      {CITIES.filter((c) => !c.capital).map((c) => (
        <Mark key={c.slug} city={c} />
      ))}
      {CITIES.filter((c) => c.capital).map((c) => (
        <Mark key={c.slug} city={c} />
      ))}

      <g className="aumap-home">
        <circle className="aumap-home-pulse" cx={hx} cy={hy} r={9} />
        <circle className="aumap-home-dot" cx={hx} cy={hy} r={5} />
        <text className="aumap-home-l" x={hx - 13} y={hy - 10} textAnchor="end">
          Epping workshop
        </text>
      </g>
    </svg>
  );
}
