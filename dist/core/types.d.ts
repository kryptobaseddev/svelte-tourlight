import type { Snippet } from 'svelte';
/** Tooltip placement relative to the target element. */
export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
/**
 * How a step (or highlight / beacon) finds its target element:
 *
 * - a CSS selector string (`'#search'`, `'[data-tour="sidebar"]'`)
 * - an element you already hold (for example one bound with `bind:this`)
 * - a resolver function that returns the element, or `null` while it does not
 *   exist yet. Use it for shadow roots, iframes you control or anything
 *   `document.querySelector` cannot reach.
 *
 * Missing targets are waited for (see `SpotlightStep.timeout`).
 */
export type SpotlightTarget = string | HTMLElement | (() => HTMLElement | null | undefined);
/**
 * Advance the tour when a DOM event fires on the step's target, or on a
 * descendant that matches `selector`. This is how "click the real button to
 * continue" steps work. A step with `advanceOn` is interactive automatically.
 */
export interface AdvanceOn {
    /** DOM event type, for example `'click'`, `'input'` or `'submit'`. */
    event: string;
    /** Only advance when the event comes from an element matching this selector inside the target. */
    selector?: string;
}
/** One step of a tour. */
export interface SpotlightStep {
    /** Stable id. Persisted progress is discarded when the ordered ids change. */
    id?: string;
    /**
     * The element to spotlight. Leave it out for a centered step with no
     * cutout (a welcome or summary card).
     */
    target?: SpotlightTarget | null;
    /** Title, shown in the tooltip header and announced to screen readers. */
    title: string;
    /** Body text, or a snippet for rich content. */
    content?: string | Snippet;
    placement?: Placement;
    /** Padding around the cutout in px. Default 8. */
    spotlightPadding?: number;
    /** Corner radius of the cutout in px. Default 8. */
    spotlightRadius?: number;
    /** An extra call-to-action button inside the tooltip. */
    action?: {
        label: string;
        onClick: () => void | Promise<void>;
    };
    /** The step is skipped when this returns false. */
    when?: () => boolean | Promise<boolean>;
    /** Runs before the step is shown. */
    onBeforeShow?: () => void | Promise<void>;
    /** Runs once the target is visible and measured. */
    onAfterShow?: () => void | Promise<void>;
    /** Runs when the step is hidden. */
    onHide?: () => void | Promise<void>;
    /** Clicking the dimmed backdrop does not dismiss the tour on this step. */
    disableOverlayClose?: boolean;
    /** Let pointer and keyboard input reach the real target through the cutout. */
    interactive?: boolean;
    /** How long (ms) to wait for the target before skipping the step. Default 5000. */
    timeout?: number;
    /**
     * The path this step lives on. When the current location does not match,
     * the provider calls `navigate(route)` and waits for the target on the new
     * page. Supports exact paths, `:param` segments and a trailing `*`.
     */
    route?: string;
    /** Runs before the target is resolved and before any route navigation. */
    onBeforeStep?: () => void | Promise<void>;
    /** Advance when this DOM event fires on the target. Implies `interactive`. */
    advanceOn?: AdvanceOn;
}
/** Tour lifecycle status. */
export type TourStatus = 'idle' | 'active' | 'completed';
/** Snapshot of one tour's progress. */
export interface TourState {
    status: TourStatus;
    /** True while the first step is being prepared. */
    isTransitioning?: boolean;
    currentStepIndex: number;
    /** Indices of the steps the user has seen. */
    seenSteps: number[];
    completedAt?: number;
    skippedAt?: {
        stepIndex: number;
        timestamp: number;
    };
}
/** A viewport-relative rectangle (the same space as `position: fixed`). */
export interface ElementRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * Synchronous storage used to persist progress across navigations and
 * reloads. It is a subset of the Web Storage API, so `localStorage` and
 * `sessionStorage` work as they are. Back a remote store with your own
 * synchronous cache.
 */
export interface SpotlightStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}
/** Button and progress labels, for translation. */
export interface SpotlightLabels {
    next?: string;
    previous?: string;
    skip?: string;
    done?: string;
    close?: string;
    loading?: string;
    stepOf?: (current: number, total: number) => string;
}
/** Options for `start(tourId, options)`. */
export interface StartOptions {
    /** Zero-based step to start at. Wins over any persisted position. */
    stepIndex?: number;
}
/** What a custom tooltip snippet receives. */
export interface TooltipRenderProps {
    step: SpotlightStep;
    next: () => void;
    previous: () => void;
    skip: () => void;
    /** Stop the tour without marking it completed or skipped. */
    close: () => void;
    currentIndex: number;
    totalSteps: number;
    isFirst: boolean;
    isLast: boolean;
    /** True for a one-off highlight rather than a tour step. */
    isHighlight: boolean;
    /** Ids the default title and body use, for `aria-labelledby` / `aria-describedby`. */
    titleId: string;
    contentId: string;
}
/** Analytics event emitted through `onEvent`. */
export type TourEvent = {
    type: 'start';
    tourId: string;
    stepIndex: number;
} | {
    type: 'step';
    tourId: string;
    stepIndex: number;
    stepId?: string;
} | {
    type: 'complete';
    tourId: string;
} | {
    type: 'skip';
    tourId: string;
    stepIndex: number;
} | {
    type: 'stop';
    tourId: string;
    stepIndex: number;
} | {
    type: 'target-missing';
    tourId: string;
    stepIndex: number;
    stepId?: string;
} | {
    type: 'highlight';
    stepId?: string;
} | {
    type: 'error';
    tourId: string | null;
    error: unknown;
};
/** Callbacks a single tour can register. */
export interface TourCallbacks {
    onComplete?: () => void;
    onSkip?: (stepIndex: number) => void;
    onStart?: () => void;
    onStepChange?: (stepIndex: number, step: SpotlightStep) => void;
    tooltip?: Snippet<[TooltipRenderProps]>;
}
