/**
 * Router-agnostic route matching for multi-page tours. Steps are compared with
 * `window.location.pathname`; pass `isRouteActive` to the provider for richer
 * matching.
 */

/** The current pathname, or `'/'` outside a browser. */
export function getCurrentPath(): string {
	if (typeof window === 'undefined' || !window.location) return '/';
	return window.location.pathname || '/';
}

function normalize(path: string): string {
	return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Whether a step's `route` matches `pathname`.
 *
 * - Exact: `'/settings'` matches only `/settings`.
 * - Trailing wildcard: `'/app/*'` matches `/app` and anything under it;
 *   `'/app*'` matches any path starting with `/app`.
 * - Dynamic segments: `'/users/:id'` matches `/users/42` (same segment count).
 */
export function isRouteActive(route: string, pathname: string): boolean {
	const r = normalize(route);
	const p = normalize(pathname);
	if (r === p) return true;
	if (r.endsWith('/*')) {
		const base = normalize(r.slice(0, -2));
		return p === base || p.startsWith(`${base}/`);
	}
	if (r.endsWith('*')) return p.startsWith(r.slice(0, -1));
	if (r.includes(':')) {
		const rSeg = r.split('/').filter(Boolean);
		const pSeg = p.split('/').filter(Boolean);
		if (rSeg.length !== pSeg.length) return false;
		return rSeg.every((seg, i) => seg.startsWith(':') || seg === pSeg[i]);
	}
	return false;
}

/**
 * Turn a route pattern into a concrete path to navigate to, filling `:param`
 * segments from `params` and dropping a trailing wildcard. Returns `null`
 * when a parameter is missing, because there is nowhere sensible to go.
 */
export function buildRoutePath(route: string, params: Record<string, string> = {}): string | null {
	let path = route.replace(/\/?\*$/, '') || '/';
	let missing = false;
	path = path.replace(/:([A-Za-z0-9_]+)/g, (_, name: string) => {
		const value = params[name];
		if (value === undefined) missing = true;
		return encodeURIComponent(value ?? '');
	});
	return missing ? null : path;
}

/** Leading slash and no trailing slash, or '' when there is no base. */
function normalizeBase(base: string | undefined): string {
	if (!base || base === '/') return '';
	return `/${base.replace(/^\/+|\/+$/g, '')}`;
}

/**
 * Remove an app base path (for example SvelteKit's `paths.base`) from a
 * pathname, so routes in tours can be written without it.
 */
export function stripBasePath(pathname: string, base: string | undefined): string {
	const b = normalizeBase(base);
	if (!b) return pathname;
	if (pathname === b) return '/';
	return pathname.startsWith(`${b}/`) ? pathname.slice(b.length) : pathname;
}

/** Prefix an app-relative route with the base path. */
export function withBasePath(route: string, base: string | undefined): string {
	const b = normalizeBase(base);
	if (!b) return route;
	return route === '/' ? `${b}/` : `${b}${route}`;
}
