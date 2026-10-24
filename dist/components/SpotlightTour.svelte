<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useSpotlight } from '../controller.svelte.js';
	import type { SpotlightStep, TooltipRenderProps } from '../core/types.js';

	interface Props {
		/** Unique tour id, passed to `start(id)`. */
		id: string;
		steps: SpotlightStep[];
		onComplete?: () => void;
		onSkip?: (stepIndex: number) => void;
		onStart?: () => void;
		onStepChange?: (stepIndex: number, step: SpotlightStep) => void;
		/** Custom tooltip for this tour only. */
		tooltip?: Snippet<[TooltipRenderProps]>;
	}

	let { id, steps, onComplete, onSkip, onStart, onStepChange, tooltip }: Props = $props();

	const tour = useSpotlight();

	// Re-register when the definition changes; this never ends a running tour.
	$effect.pre(() => {
		const definition = {
			id,
			steps,
			callbacks: { onComplete, onSkip, onStart, onStepChange, tooltip }
		};
		untrack(() => tour.registerTour(definition.id, definition.steps, definition.callbacks));
	});

	// Unregister only when the id changes or the component goes away.
	$effect(() => {
		const current = id;
		return () => tour.unregisterTour(current);
	});
</script>
