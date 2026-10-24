/**
 * svelte-tourlight/core: the headless engine. State machine, target
 * resolution and tracking, clip-path cutouts, focus trap, inert, keyboard,
 * routes and persistence. No CSS, no components and no Floating UI.
 */
export {
	createTourStateMachine,
	type TourStateMachine,
	type TourStateMachineOptions
} from './state-machine.js';
export {
	resolveTarget,
	waitForElement,
	isElementVisible,
	measureElement,
	scrollIntoView,
	type WaitForElementOptions,
	type ScrollIntoViewOptions
} from './element.js';
export { trackTarget, type TargetTrackerOptions } from './target-tracker.js';
export { generateClipPath, generateEmptyClipPath, blockerRects } from './clip-path.js';
export {
	createKeyboardHandler,
	type KeyboardHandler,
	type KeyboardHandlerOptions
} from './keyboard.js';
export {
	createFocusTrap,
	setInert,
	getStepAriaLabel,
	prefersReducedMotion,
	type FocusTrap
} from './a11y.js';
export { getCurrentPath, isRouteActive, buildRoutePath } from './route.js';
export {
	DEFAULT_PERSIST_KEY,
	createMemoryStorage,
	resolveStorage,
	loadPersistedTours,
	savePersistedTour,
	clearPersistedTour,
	isPersistedStateFresh,
	toTourState,
	stableStepIds,
	type PersistedTourState
} from './persistence.js';
export { runCallback } from './callback.js';
export type * from './types.js';
