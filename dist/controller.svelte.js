import { createContext } from 'svelte';
import { MediaQuery } from 'svelte/reactivity';
import { prefersReducedMotion } from 'svelte/motion';
import { createTourStateMachine } from './core/state-machine.js';
import { resolveTarget, scrollIntoView, waitForElement } from './core/element.js';
import { trackTarget } from './core/target-tracker.js';
import { getCurrentPath, isRouteActive as defaultIsRouteActive, stripBasePath, withBasePath } from './core/route.js';
import { DEFAULT_PERSIST_KEY, clearPersistedTour, isPersistedStateFresh, loadPersistedTours, resolveStorage, savePersistedTour, stableStepIds } from './core/persistence.js';
import { runCallback } from './core/callback.js';
/** Context key. Most apps use `useSpotlight()` instead. */
const [getTourlightContext, setTourlightContext, hasTourlightContext] = createContext();
export { setTourlightContext, hasTourlightContext };
/**
 * The tour controller returned by `useSpotlight()`. Its fields are reactive:
 * read `tour.isActive` or `tour.currentStep` in markup or `$derived`.
 */
export function useSpotlight() {
    if (!hasTourlightContext()) {
        throw new Error('svelte-tourlight: useSpotlight() must be called inside <SpotlightProvider>.');
    }
    return getTourlightContext();
}
/**
 * The reactive tour controller behind `<SpotlightProvider>`. It owns the
 * registered tours, the active state machine, target resolution and
 * persistence. Rendering lives in the components.
 */
export class Tourlight {
    /** Id of the running tour, or null. */
    activeTourId = $state(null);
    /** Index of the visible step (-1 while the first step is prepared). */
    currentStep = $state(0);
    /** Step count of the active tour. */
    totalSteps = $state(0);
    /** The spotlighted element, once found and visible. */
    targetElement = $state.raw(null);
    /** Its viewport rect (padding included). */
    targetRect = $state.raw(null);
    /** The active one-off highlight, if any. */
    highlightStep = $state.raw(null);
    /** True while the current step's target is being looked for. */
    resolving = $state(false);
    /** A tour or highlight is showing. */
    isActive = $derived(this.activeTourId !== null || this.highlightStep !== null);
    #options;
    // Plain collections on purpose: #tick signals registration changes.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    #tours = new Map();
    #tick = $state(0);
    #machine = null;
    #stepAbort = null;
    #highlightAbort = null;
    #highlightGeneration = 0;
    #trigger = null;
    #reportedStep = null;
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    #resumed = new Set();
    #sheetQuery;
    #destroyed = false;
    /** Pass a getter so the provider's props stay reactive. */
    constructor(options = {}) {
        this.#options = typeof options === 'function' ? options : () => options;
        // Read once: the breakpoint is a layout decision, not live state.
        const bp = this.#options().mobileBreakpoint ?? 640;
        this.#sheetQuery = bp > 0 ? new MediaQuery(`(max-width: ${bp - 0.02}px)`, false) : null;
    }
    get options() {
        return this.#options();
    }
    /** The step being shown (tour step or highlight). */
    get step() {
        if (this.highlightStep)
            return this.highlightStep;
        void this.#tick;
        if (!this.activeTourId || this.currentStep < 0)
            return null;
        return this.#tours.get(this.activeTourId)?.steps[this.currentStep] ?? null;
    }
    /** The custom tooltip snippet registered with the active tour, if any. */
    get tourTooltip() {
        void this.#tick;
        return this.activeTourId ? this.#tours.get(this.activeTourId)?.tooltip : undefined;
    }
    /** Reduced motion requested (option, or the OS setting). */
    get reducedMotion() {
        return this.options.reducedMotion ?? prefersReducedMotion.current;
    }
    /** The tooltip renders as a sheet (narrow viewport). */
    get isSheet() {
        return this.#sheetQuery?.current ?? false;
    }
    /** Which edge the sheet docks to, or null when the tooltip floats. */
    get sheetDock() {
        if (!this.isSheet)
            return null;
        const position = this.options.sheetPosition ?? 'auto';
        if (position !== 'auto')
            return position;
        const rect = this.targetRect;
        if (!rect || typeof window === 'undefined')
            return 'bottom';
        return rect.y + rect.height / 2 > window.innerHeight * 0.55 ? 'top' : 'bottom';
    }
    /** The current step lets real input through to its target. */
    get isInteractive() {
        const step = this.step;
        return !!step && (!!step.interactive || !!step.advanceOn);
    }
    /** Ids of the registered tours. */
    get tourIds() {
        void this.#tick;
        return [...this.#tours.keys()];
    }
    // ---------------------------------------------------------------- tours
    /** Register (or update) a tour. `<SpotlightTour>` calls this for you. */
    registerTour(id, steps, callbacks = {}) {
        if (this.activeTourId === id) {
            this.totalSteps = steps.length;
            if (this.#machine && this.#machine.getState().currentStepIndex >= steps.length)
                this.#machine.stop();
        }
        this.#tours.set(id, { steps, ...callbacks });
        this.#tick++;
        this.#maybeResume(id);
    }
    /** Remove a tour; stops it when it is running. */
    unregisterTour(id) {
        if (!this.#tours.delete(id))
            return;
        this.#tick++;
        // Deferred: when the whole provider is unmounting, keep stored progress
        // so the tour can resume on the next mount.
        queueMicrotask(() => {
            if (!this.#destroyed && this.activeTourId === id && !this.#tours.has(id))
                this.stop();
        });
    }
    /** Start a tour, optionally at a step. Only one tour runs at a time. */
    start(tourId, options = {}) {
        const tour = this.#tours.get(tourId);
        if (!tour) {
            console.warn(`svelte-tourlight: tour "${tourId}" is not registered. Mount <SpotlightTour id="${tourId}"> first.`);
            return;
        }
        if (this.highlightStep)
            this.dismissHighlight();
        if (this.activeTourId)
            this.#machine?.stop();
        this.#trigger =
            typeof document !== 'undefined' ? document.activeElement : null;
        const storage = this.#storage();
        const persisted = storage ? loadPersistedTours(storage, this.#persistKey())[tourId] : undefined;
        const persistedInit = persisted?.status === 'active' &&
            isPersistedStateFresh(persisted, tour.steps.length, this.options.persistMaxAge, stableStepIds(tour.steps))
            ? { currentStepIndex: persisted.currentStepIndex, seenSteps: persisted.seenSteps }
            : undefined;
        const requested = options.stepIndex;
        const explicitInit = requested !== undefined &&
            Number.isInteger(requested) &&
            requested >= 0 &&
            requested < tour.steps.length
            ? { currentStepIndex: requested, seenSteps: [] }
            : undefined;
        this.#reportedStep = null;
        const machine = createTourStateMachine({
            steps: tour.steps,
            getSteps: () => this.#tours.get(tourId)?.steps ?? tour.steps,
            deferAfterShow: true,
            onError: (error) => this.#error(error, tourId),
            initialState: {
                ...(explicitInit ?? persistedInit ?? this.options.initialState?.[tourId]),
                status: 'idle'
            },
            onComplete: () => {
                this.#tours.get(tourId)?.onComplete?.();
                this.options.onComplete?.(tourId);
                this.#emit({ type: 'complete', tourId });
            },
            onSkip: (stepIndex) => {
                this.#tours.get(tourId)?.onSkip?.(stepIndex);
                this.options.onSkip?.(tourId, stepIndex);
                this.#emit({ type: 'skip', tourId, stepIndex });
            },
            onStateChange: (state) => {
                if (this.#machine === machine && !this.#destroyed)
                    this.#handleState(tourId, state);
            }
        });
        this.#machine = machine;
        this.activeTourId = tourId;
        this.currentStep = -1;
        this.totalSteps = tour.steps.length;
        this.targetElement = null;
        this.targetRect = null;
        tour.onStart?.();
        this.options.onStart?.(tourId);
        this.#emit({
            type: 'start',
            tourId,
            stepIndex: explicitInit?.currentStepIndex ?? persistedInit?.currentStepIndex ?? 0
        });
        void machine.start();
    }
    /** Stop the tour without completing or skipping it. */
    stop = () => {
        const id = this.activeTourId;
        const index = this.currentStep;
        if (this.#machine?.getState().status === 'active' && id)
            this.#emit({ type: 'stop', tourId: id, stepIndex: index });
        this.#machine?.stop();
    };
    next = () => void this.#machine?.next();
    previous = () => void this.#machine?.previous();
    skip = () => this.#machine?.skip();
    goToStep = (index) => void this.#machine?.goToStep(index);
    /** Spotlight one element with a tooltip, outside any tour. */
    highlight(step) {
        if (this.activeTourId)
            this.stop();
        this.#trigger =
            typeof document !== 'undefined' ? document.activeElement : null;
        this.highlightStep = step;
        this.targetElement = null;
        this.targetRect = null;
        const generation = ++this.#highlightGeneration;
        this.#highlightAbort?.abort();
        const controller = new AbortController();
        this.#highlightAbort = controller;
        this.#emit({ type: 'highlight', stepId: step.id });
        if (!step.target) {
            this.resolving = false;
            return;
        }
        this.resolving = true;
        void this.#resolve(step, controller.signal)
            .then((el) => {
            if (generation !== this.#highlightGeneration || this.#destroyed)
                return;
            if (!el) {
                this.dismissHighlight();
                return;
            }
            trackTarget(step.target, el, {
                signal: controller.signal,
                timeout: step.timeout ?? this.options.waitForElementTimeout,
                padding: () => step.spotlightPadding ?? 8,
                onChange: (element, rect) => {
                    this.resolving = !element;
                    this.targetElement = element;
                    this.targetRect = rect;
                },
                onTimeout: () => this.dismissHighlight()
            });
        })
            .catch((error) => {
            if (generation !== this.#highlightGeneration)
                return;
            this.dismissHighlight();
            this.#error(error, null);
        });
    }
    /** Close the active highlight. */
    dismissHighlight = () => {
        if (!this.highlightStep)
            return;
        this.#highlightGeneration++;
        this.#highlightAbort?.abort();
        runCallback(this.highlightStep.onHide, (error) => this.#error(error, null));
        this.highlightStep = null;
        this.targetElement = null;
        this.targetRect = null;
        this.resolving = false;
        this.#restoreFocus();
    };
    /** The backdrop was clicked. */
    overlayClick = () => {
        if (this.options.overlayClickToDismiss === false)
            return;
        const step = this.step;
        if (step?.disableOverlayClose)
            return;
        if (this.highlightStep)
            this.dismissHighlight();
        else
            this.skip();
    };
    /** Clear stored progress for one tour, or all of them. */
    resetProgress(tourId) {
        const storage = this.#storage();
        if (!storage)
            return;
        const key = this.#persistKey();
        if (tourId)
            clearPersistedTour(storage, key, tourId);
        else
            try {
                storage.removeItem(key);
            }
            catch {
                // Best effort.
            }
    }
    /** Cancel all work. The provider calls this on unmount. */
    destroy() {
        this.#destroyed = true;
        this.#machine?.dispose();
        this.#stepAbort?.abort();
        this.#highlightAbort?.abort();
    }
    // ------------------------------------------------------------ internals
    #storage() {
        return typeof window === 'undefined' ? null : resolveStorage(this.options.persist);
    }
    #persistKey() {
        return this.options.persistKey ?? DEFAULT_PERSIST_KEY;
    }
    #emit(event) {
        runCallback(() => this.options.onEvent?.(event), (error) => console.error('svelte-tourlight: onEvent threw', error));
    }
    #error(error, tourId) {
        this.options.onError?.(error, tourId);
        this.#emit({ type: 'error', tourId, error });
    }
    #matches(route) {
        const path = stripBasePath(getCurrentPath(), this.options.basePath);
        return (this.options.isRouteActive ?? defaultIsRouteActive)(route, path);
    }
    #maybeResume(id) {
        const storage = this.#storage();
        if (!storage || this.options.resume === false || this.#resumed.has(id))
            return;
        const tour = this.#tours.get(id);
        if (!tour)
            return;
        const persisted = loadPersistedTours(storage, this.#persistKey())[id];
        if (persisted?.status !== 'active')
            return;
        if (!isPersistedStateFresh(persisted, tour.steps.length, this.options.persistMaxAge, stableStepIds(tour.steps)))
            return;
        this.#resumed.add(id);
        // Defer so sibling tours finish registering and the page can settle.
        queueMicrotask(() => {
            if (!this.activeTourId && !this.#destroyed && this.#tours.has(id))
                this.start(id);
        });
    }
    #handleState(tourId, state) {
        const storage = this.#storage();
        if (storage) {
            const key = this.#persistKey();
            if (state.status === 'idle')
                clearPersistedTour(storage, key, tourId);
            else {
                const steps = this.#tours.get(tourId)?.steps ?? [];
                savePersistedTour(storage, key, tourId, state, steps.length || state.currentStepIndex + 1, stableStepIds(steps));
            }
        }
        if (state.status === 'active' &&
            !state.isTransitioning &&
            state.currentStepIndex !== this.currentStep) {
            this.currentStep = state.currentStepIndex;
            this.#showStep(tourId, state.currentStepIndex);
        }
        if (state.status === 'idle' || state.status === 'completed') {
            this.#stepAbort?.abort();
            this.activeTourId = null;
            this.targetElement = null;
            this.targetRect = null;
            this.resolving = false;
            this.#machine = null;
            this.#restoreFocus();
        }
        this.options.onStateChange?.(tourId, state);
    }
    async #resolve(step, signal) {
        const target = step.route
            ? () => (this.#matches(step.route) ? resolveTarget(step.target) : null)
            : step.target;
        const el = await waitForElement(target, {
            timeout: step.timeout ?? this.options.waitForElementTimeout,
            signal,
            requireVisible: true
        });
        if (!el)
            return null;
        if (this.options.autoScroll !== false) {
            await scrollIntoView(el, {
                smooth: !this.reducedMotion,
                // Keep the target clear of the sheet: above a bottom sheet, below a top one.
                band: !this.isSheet ? [0, 1] : this.options.sheetPosition === 'top' ? [0.45, 1] : [0, 0.55]
            });
        }
        return signal.aborted ? null : el;
    }
    #showStep(tourId, index) {
        this.#stepAbort?.abort();
        const controller = new AbortController();
        this.#stepAbort = controller;
        const signal = controller.signal;
        this.targetElement = null;
        this.targetRect = null;
        const step = this.#tours.get(tourId)?.steps[index];
        if (!step)
            return;
        this.resolving = true;
        const stillCurrent = () => !signal.aborted &&
            this.#machine?.getState().status === 'active' &&
            this.#machine.getState().currentStepIndex === index;
        const unavailable = () => {
            if (!stillCurrent())
                return;
            this.#emit({ type: 'target-missing', tourId, stepIndex: index, stepId: step.id });
            void this.#machine?.next();
        };
        void (async () => {
            await step.onBeforeStep?.();
            if (signal.aborted)
                return;
            if (step.route && !this.#matches(step.route))
                await this.options.navigate?.(withBasePath(step.route, this.options.basePath));
            if (signal.aborted)
                return;
            if (!step.target) {
                if (step.route && !this.#matches(step.route)) {
                    // Centered step on another page: wait for the route to take effect.
                    const arrived = await waitForElement(() => (this.#matches(step.route) ? document.body : null), {
                        timeout: step.timeout ?? this.options.waitForElementTimeout,
                        signal
                    });
                    if (!arrived)
                        return unavailable();
                }
                this.resolving = false;
                this.#reportStep(tourId, index, step);
                return;
            }
            const el = await this.#resolve(step, signal);
            if (signal.aborted)
                return;
            if (!el)
                return unavailable();
            const resolver = () => {
                const latest = this.#tours.get(tourId)?.steps[index];
                if (!latest)
                    return null;
                if (latest.route && !this.#matches(latest.route))
                    return null;
                return resolveTarget(latest.target);
            };
            trackTarget(resolver, el, {
                signal,
                timeout: step.timeout ?? this.options.waitForElementTimeout,
                padding: () => this.#tours.get(tourId)?.steps[index]?.spotlightPadding ?? 8,
                onChange: (element, rect) => {
                    this.resolving = !element;
                    this.targetElement = element;
                    this.targetRect = rect;
                    if (element)
                        this.#reportStep(tourId, index, step);
                },
                onTimeout: unavailable
            });
        })().catch((error) => {
            if (signal.aborted)
                return;
            this.#machine?.stop();
            this.#error(error, tourId);
        });
    }
    /** A step counts as viewed once its target is found and measured, and only once. */
    #reportStep(tourId, index, step) {
        if (this.#reportedStep === index)
            return;
        this.#reportedStep = index;
        const machine = this.#machine;
        const report = (error) => {
            if (this.#machine === machine)
                machine?.stop();
            this.#error(error, tourId);
        };
        runCallback(step.onAfterShow, report);
        runCallback(() => this.#tours.get(tourId)?.onStepChange?.(index, step), report);
        runCallback(() => this.options.onStepChange?.(tourId, index, step), report);
        this.#emit({ type: 'step', tourId, stepIndex: index, stepId: step.id });
    }
    #restoreFocus() {
        const trigger = this.#trigger;
        this.#trigger = null;
        if (typeof requestAnimationFrame === 'undefined')
            return;
        // Inert is removed when the overlay unmounts; focus after that.
        requestAnimationFrame(() => {
            if (!this.activeTourId && !this.highlightStep && trigger?.isConnected)
                trigger.focus();
        });
    }
}
