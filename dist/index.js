// svelte-tourlight: product tours for Svelte 5.
export { default as SpotlightProvider } from './components/SpotlightProvider.svelte';
export { default as SpotlightTour } from './components/SpotlightTour.svelte';
export { default as SpotlightBeacon } from './components/SpotlightBeacon.svelte';
export { default as SpotlightHighlight } from './components/SpotlightHighlight.svelte';
export { default as SpotlightTooltip } from './components/SpotlightTooltip.svelte';
export { default as SpotlightOverlay } from './components/SpotlightOverlay.svelte';
export { portal } from './components/portal.js';
export { Tourlight, useSpotlight, setTourlightContext, hasTourlightContext } from './controller.svelte.js';
export { themeName, themeStyle, themeVar } from './themes.js';
export { createMemoryStorage, isRouteActive, buildRoutePath, getStepAriaLabel } from './core/index.js';
