<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useSpotlight } from '../controller.svelte.js';
	import type { Placement, SpotlightTarget } from '../core/types.js';

	interface Props {
		target: SpotlightTarget;
		title: string;
		content?: string | Snippet;
		/** Show the highlight while true. Default true. */
		active?: boolean;
		placement?: Placement;
		spotlightPadding?: number;
		spotlightRadius?: number;
		/** Called when the highlight closes. */
		onDismiss?: () => void;
	}

	let {
		target,
		title,
		content,
		active = true,
		placement,
		spotlightPadding,
		spotlightRadius,
		onDismiss
	}: Props = $props();

	const tour = useSpotlight();
	let shown = false;

	// A one-off "What's new" callout, driven by `active`.
	$effect(() => {
		if (active) {
			untrack(() => {
				shown = true;
				tour.highlight({
					target,
					title,
					content,
					placement,
					spotlightPadding,
					spotlightRadius,
					onHide: () => {
						shown = false;
						onDismiss?.();
					}
				});
			});
			return () => {
				if (shown) tour.dismissHighlight();
			};
		}
	});
</script>
