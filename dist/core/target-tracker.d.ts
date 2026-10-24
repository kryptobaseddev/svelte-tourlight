import type { ElementRect, SpotlightTarget } from './types.js';
export interface TargetTrackerOptions {
    signal: AbortSignal;
    timeout?: number;
    padding: () => number;
    /** Called with the current element and rect, or `null`s while the target is reacquired. */
    onChange: (element: HTMLElement | null, rect: ElementRect | null) => void;
    /** The target disappeared and did not come back within `timeout`. */
    onTimeout: () => void;
}
/**
 * Follow an active target's identity and geometry every frame. When the
 * element disappears (re-render, virtualised list) it reports `null`, waits
 * for it to return and resumes. All work stops when `signal` aborts.
 */
export declare function trackTarget(target: SpotlightTarget, initialElement: HTMLElement, options: TargetTrackerOptions): () => void;
