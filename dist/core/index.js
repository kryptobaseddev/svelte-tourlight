/**
 * svelte-tourlight/core: the headless engine. State machine, target
 * resolution and tracking, clip-path cutouts, focus trap, inert, keyboard,
 * routes and persistence. No CSS, no components and no Floating UI.
 */
export { createTourStateMachine } from './state-machine.js';
export { resolveTarget, waitForElement, isElementVisible, measureElement, scrollIntoView } from './element.js';
export { trackTarget } from './target-tracker.js';
export { generateClipPath, generateEmptyClipPath, blockerRects } from './clip-path.js';
export { createKeyboardHandler } from './keyboard.js';
export { createFocusTrap, setInert, getStepAriaLabel, prefersReducedMotion } from './a11y.js';
export { getCurrentPath, isRouteActive, buildRoutePath } from './route.js';
export { DEFAULT_PERSIST_KEY, createMemoryStorage, resolveStorage, loadPersistedTours, savePersistedTour, clearPersistedTour, isPersistedStateFresh, toTourState, stableStepIds } from './persistence.js';
export { runCallback } from './callback.js';
