import type { ElementRect } from './types.js';
/**
 * A CSS `clip-path: path(...)` that covers the viewport except for a rounded
 * rectangle around `rect`.
 *
 * Both subpaths are drawn clockwise, so the `evenodd` fill rule is what makes
 * the inner rectangle a hole (two crossings, even, outside). With the default
 * `nonzero` rule the hole would be filled.
 */
export declare function generateClipPath(rect: ElementRect, padding?: number, radius?: number): string;
/** A clip-path covering the whole viewport with no hole. */
export declare function generateEmptyClipPath(): string;
/**
 * The four rectangles around a hole. In interactive steps they catch backdrop
 * clicks while the hole itself is left uncovered, so real events reach the
 * target with no synthetic dispatch.
 */
export declare function blockerRects(rect: ElementRect): Record<'top' | 'bottom' | 'left' | 'right', Record<string, string>>;
