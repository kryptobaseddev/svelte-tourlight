import type { ElementRect, SpotlightTarget } from './types.js';
/**
 * Resolve a target to an element. Never throws: an invalid selector or a
 * resolver that throws counts as "not found yet".
 */
export declare function resolveTarget(target: SpotlightTarget | null | undefined): HTMLElement | null;
/** Connected, laid out, and not hidden by itself or any ancestor (shadow hosts included). */
export declare function isElementVisible(element: Element): boolean;
/** Viewport-relative rect of an element, grown by `padding` on every side. */
export declare function measureElement(element: Element, padding?: number): ElementRect;
export interface WaitForElementOptions {
    /** Maximum wait in ms. Default 5000. */
    timeout?: number;
    /** Stops waiting immediately, resolving `null`. */
    signal?: AbortSignal;
    /** Wait until the element is also visible with a non-zero box. */
    requireVisible?: boolean;
}
/**
 * Wait for a target to appear, using a MutationObserver plus a light poll for
 * changes that do not mutate the DOM (CSS transitions, resolver state).
 * Resolves `null` on timeout or abort.
 */
export declare function waitForElement(target: SpotlightTarget, options?: WaitForElementOptions): Promise<HTMLElement | null>;
export interface ScrollIntoViewOptions {
    /** Smooth scroll. Ignored (instant) when reduced motion is requested. */
    smooth?: boolean;
    /**
     * Fraction of the viewport height, from the top, that the target should sit
     * inside. The bottom-sheet tooltip passes about 0.55 so the target lands
     * above the sheet. Default 1 (anywhere on screen).
     */
    visibleFraction?: number;
}
/**
 * Scroll an element into view when it is not already inside the visible
 * area, then wait two frames for layout to settle.
 */
export declare function scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): Promise<void>;
