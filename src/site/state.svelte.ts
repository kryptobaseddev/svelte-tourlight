import type { TourEvent } from '#lib';

export type ThemeChoice = 'light' | 'dark' | 'auto' | 'custom';

/** Site-wide demo settings, read by the provider in the root layout. */
export const site = $state({
	theme: 'auto' as ThemeChoice,
	/** undefined follows the OS setting. */
	reducedMotion: undefined as boolean | undefined,
	sheetPosition: 'auto' as 'auto' | 'top' | 'bottom',
	events: [] as { at: string; text: string }[]
});

export function logEvent(event: TourEvent) {
	const parts: string[] = [event.type];
	if ('tourId' in event && event.tourId) parts.push(event.tourId);
	if ('stepIndex' in event) parts.push(`step ${event.stepIndex + 1}`);
	if ('stepId' in event && event.stepId) parts.push(`#${event.stepId}`);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a one-off timestamp, not state
	const at = new Date(Date.now()).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
	site.events = [{ at, text: parts.join(' · ') }, ...site.events].slice(0, 30);
}
