import { type Snippet } from 'svelte';
import type { ThemeProp } from './themes.js';
import type { ElementRect, SpotlightLabels, SpotlightStep, SpotlightStorage, StartOptions, TooltipRenderProps, TourCallbacks, TourEvent, TourState } from './core/types.js';
/** Options shared by `<SpotlightProvider>` and `new Tourlight()`. */
export interface TourlightOptions {
    /** `'light'` (default), `'dark'`, `'auto'` (follows the OS) or a custom theme. */
    theme?: ThemeProp;
    /** Escape dismisses (skips) the tour. Default true. */
    escToDismiss?: boolean;
    /** Clicking the dimmed backdrop skips the tour. Default true. */
    overlayClickToDismiss?: boolean;
    /** Show the progress bar. Default true. */
    showProgress?: boolean;
    /** Show the Skip button. Default true. */
    showSkip?: boolean;
    labels?: SpotlightLabels;
    /** Default wait (ms) for a step's target before the step is skipped. Default 5000. */
    waitForElementTimeout?: number;
    /**
     * Keep progress across navigations and reloads. `true` uses
     * `localStorage`; pass `sessionStorage`, `createMemoryStorage()` or your
     * own synchronous adapter for anything else.
     */
    persist?: boolean | SpotlightStorage;
    /** Storage key. Default `'svelte-tourlight'`. */
    persistKey?: string;
    /** Ignore stored progress older than this (ms). */
    persistMaxAge?: number;
    /** Resume a stored, still-active tour when it registers. Default true. */
    resume?: boolean;
    /** Restore stored states yourself (for example from your API). */
    initialState?: Record<string, TourState>;
    /**
     * Called when a step's `route` does not match the current location. Plug in
     * your router: SvelteKit's `goto` works as is. A returned promise is awaited.
     */
    navigate?: (path: string) => void | Promise<unknown>;
    /**
     * The app's base path, for example SvelteKit's `base` from `$app/paths`.
     * Step routes are written without it: it is stripped before matching and
     * added to the path passed to `navigate`.
     */
    basePath?: string;
    /** Custom route matcher. Defaults to exact, `:param` and trailing `*` matching. */
    isRouteActive?: (route: string, pathname: string) => boolean;
    /** Scroll each target into view. Default true. */
    autoScroll?: boolean;
    /** Force reduced motion on or off. Default: follow the OS setting. */
    reducedMotion?: boolean;
    /**
     * Where the phone sheet docks. `'auto'` (default) docks at the bottom, or at
     * the top when the target's centre is in the lower 45% of the viewport (a
     * fixed tab bar, for example). `'top'` and `'bottom'` force one side.
     */
    sheetPosition?: 'auto' | 'top' | 'bottom';
    /** Below this viewport width (px) the tooltip becomes a sheet. 0 disables. Default 640. */
    mobileBreakpoint?: number;
    onStart?: (tourId: string) => void;
    onStepChange?: (tourId: string, stepIndex: number, step: SpotlightStep) => void;
    onComplete?: (tourId: string) => void;
    onSkip?: (tourId: string, stepIndex: number) => void;
    onStateChange?: (tourId: string, state: TourState) => void;
    /** A lifecycle hook or callback threw. The tour stops safely. */
    onError?: (error: unknown, tourId: string | null) => void;
    /** One stream of analytics events (start, step, complete, skip, stop, target-missing, highlight, error). */
    onEvent?: (event: TourEvent) => void;
}
/** Context key. Most apps use `useSpotlight()` instead. */
declare const setTourlightContext: (context: Tourlight) => Tourlight, hasTourlightContext: () => boolean;
export { setTourlightContext, hasTourlightContext };
/**
 * The tour controller returned by `useSpotlight()`. Its fields are reactive:
 * read `tour.isActive` or `tour.currentStep` in markup or `$derived`.
 */
export declare function useSpotlight(): Tourlight;
/**
 * The reactive tour controller behind `<SpotlightProvider>`. It owns the
 * registered tours, the active state machine, target resolution and
 * persistence. Rendering lives in the components.
 */
export declare class Tourlight {
    #private;
    /** Id of the running tour, or null. */
    activeTourId: string | null;
    /** Index of the visible step (-1 while the first step is prepared). */
    currentStep: number;
    /** Step count of the active tour. */
    totalSteps: number;
    /** The spotlighted element, once found and visible. */
    targetElement: HTMLElement | null;
    /** Its viewport rect (padding included). */
    targetRect: ElementRect | null;
    /** The active one-off highlight, if any. */
    highlightStep: SpotlightStep | null;
    /** True while the current step's target is being looked for. */
    resolving: boolean;
    /** A tour or highlight is showing. */
    isActive: boolean;
    /** Pass a getter so the provider's props stay reactive. */
    constructor(options?: TourlightOptions | (() => TourlightOptions));
    get options(): TourlightOptions;
    /** The step being shown (tour step or highlight). */
    get step(): SpotlightStep | null;
    /** The custom tooltip snippet registered with the active tour, if any. */
    get tourTooltip(): Snippet<[TooltipRenderProps]> | undefined;
    /** Reduced motion requested (option, or the OS setting). */
    get reducedMotion(): boolean;
    /** The tooltip renders as a sheet (narrow viewport). */
    get isSheet(): boolean;
    /** Which edge the sheet docks to, or null when the tooltip floats. */
    get sheetDock(): 'top' | 'bottom' | null;
    /** The current step lets real input through to its target. */
    get isInteractive(): boolean;
    /** Ids of the registered tours. */
    get tourIds(): string[];
    /** Register (or update) a tour. `<SpotlightTour>` calls this for you. */
    registerTour(id: string, steps: SpotlightStep[], callbacks?: TourCallbacks): void;
    /** Remove a tour; stops it when it is running. */
    unregisterTour(id: string): void;
    /** Start a tour, optionally at a step. Only one tour runs at a time. */
    start(tourId: string, options?: StartOptions): void;
    /** Stop the tour without completing or skipping it. */
    stop: () => void;
    next: () => void;
    previous: () => void;
    skip: () => void;
    goToStep: (index: number) => void;
    /** Spotlight one element with a tooltip, outside any tour. */
    highlight(step: SpotlightStep): void;
    /** Close the active highlight. */
    dismissHighlight: () => void;
    /** The backdrop was clicked. */
    overlayClick: () => void;
    /** Clear stored progress for one tour, or all of them. */
    resetProgress(tourId?: string): void;
    /** Cancel all work. The provider calls this on unmount. */
    destroy(): void;
}
