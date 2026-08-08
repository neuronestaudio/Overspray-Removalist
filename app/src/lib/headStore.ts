/**
 * Head capture for the SSR pass.
 *
 * PageMeta writes into the active store during render; entry-server opens a
 * store before renderToString and closes it after, then hands the result to
 * the pre-renderer which writes real <title>/<meta>/<link> tags into the static
 * HTML. On the client the same component writes straight to the DOM instead.
 */
export interface HeadData {
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  image: string;
  imageAlt: string;
  jsonLd: object[];
}

let activeStore: HeadData | null = null;

export function startCapture(): HeadData {
  activeStore = {
    title: '',
    description: '',
    canonical: '',
    noindex: false,
    image: '',
    imageAlt: '',
    jsonLd: [],
  };
  return activeStore;
}

export function endCapture(): void {
  activeStore = null;
}

export function recordHead(data: {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  jsonLd?: object[];
}): void {
  if (!activeStore) return;
  activeStore.title = data.title;
  activeStore.description = data.description;
  activeStore.canonical = data.canonical;
  activeStore.noindex = Boolean(data.noindex);
  activeStore.image = data.image ?? '';
  activeStore.imageAlt = data.imageAlt ?? '';
  activeStore.jsonLd = data.jsonLd ?? [];
}
