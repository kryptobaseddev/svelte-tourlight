/**
 * Router-agnostic route matching for multi-page tours. Steps are compared with
 * `window.location.pathname`; pass `isRouteActive` to the provider for richer
 * matching.
 */
/** The current pathname, or `'/'` outside a browser. */
export declare function getCurrentPath(): string;
/**
 * Whether a step's `route` matches `pathname`.
 *
 * - Exact: `'/settings'` matches only `/settings`.
 * - Trailing wildcard: `'/app/*'` matches `/app` and anything under it;
 *   `'/app*'` matches any path starting with `/app`.
 * - Dynamic segments: `'/users/:id'` matches `/users/42` (same segment count).
 */
export declare function isRouteActive(route: string, pathname: string): boolean;
/**
 * Turn a route pattern into a concrete path to navigate to, filling `:param`
 * segments from `params` and dropping a trailing wildcard. Returns `null`
 * when a parameter is missing, because there is nowhere sensible to go.
 */
export declare function buildRoutePath(route: string, params?: Record<string, string>): string | null;
