<script lang="ts">
	import { blockerRects, generateClipPath, generateEmptyClipPath } from '../core/clip-path.js';
	import type { ElementRect } from '../core/types.js';

	interface Props {
		/** The target's padded rect, or null for no cutout. */
		rect: ElementRect | null;
		radius?: number;
		/** Leave a real hole in the pointer surface so input reaches the target. */
		interactive?: boolean;
		loading?: boolean;
		onclick?: () => void;
	}

	let { rect, radius = 8, interactive = false, loading = false, onclick }: Props = $props();

	const clipPath = $derived(rect ? generateClipPath(rect, 0, radius) : generateEmptyClipPath());
	const passthrough = $derived(interactive && rect !== null);
	const blockers = $derived(passthrough && rect ? Object.entries(blockerRects(rect)) : []);

	function handle(event: MouseEvent) {
		event.stopPropagation();
		onclick?.();
	}

	function styleOf(style: Record<string, string>): string {
		return Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
	}
</script>

<!-- The backdrop is a mouse convenience; Escape and the Close button are the keyboard paths. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="tourlight-overlay"
	style:clip-path={clipPath}
	style:-webkit-clip-path={clipPath}
	style:pointer-events={passthrough ? 'none' : 'auto'}
	data-loading={loading ? '' : undefined}
	aria-hidden="true"
	onclick={passthrough ? undefined : handle}
></div>
{#each blockers as [side, style] (side)}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="tourlight-blocker"
		style={styleOf(style)}
		aria-hidden="true"
		data-side={side}
		onclick={handle}
	></div>
{/each}
