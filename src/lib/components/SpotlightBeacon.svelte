<script lang="ts" module>
	/** Where the dot sits on the target's box. */
	export type BeaconPosition =
		| 'top-left'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-right'
		| 'center'
		| 'left'
		| 'right'
		| 'top'
		| 'bottom';
</script>

<script lang="ts">
	import { useSpotlight } from '../controller.svelte.js';
	import { measureElement, resolveTarget, waitForElement } from '../core/element.js';
	import type { ElementRect, SpotlightStep, SpotlightTarget } from '../core/types.js';
	import { themeName, themeStyle } from '../themes.js';
	import { portal, type PortalTarget } from './portal.js';

	interface Props {
		/** The element the dot is attached to. */
		target: SpotlightTarget;
		/** Tour to start on click. Wins over `highlight`. */
		tour?: string;
		/** Step to start `tour` at. */
		stepIndex?: number;
		/** One-off highlight to show on click; its target defaults to the beacon's. */
		highlight?: Omit<SpotlightStep, 'target'> & { target?: SpotlightTarget };
		/** Runs before the tour or highlight starts. */
		onclick?: () => void;
		/** Render the beacon. Default true. */
		active?: boolean;
		/** Hide while a tour or highlight is showing. Default true. */
		hideWhileActive?: boolean;
		position?: BeaconPosition;
		/** Push the dot outward by this many px. */
		offset?: number;
		/** Dot diameter in px. Default 12. The hit area is always at least 44px. */
		size?: number;
		/** Dot colour; defaults to the theme's beacon colour. */
		color?: string;
		/** Accessible name. Default "Start tour". */
		label?: string;
		class?: string;
		portalTarget?: PortalTarget;
		/** Max wait (ms) for the target. Default 5000. */
		timeout?: number;
	}

	let {
		target,
		tour: tourId,
		stepIndex,
		highlight,
		onclick,
		active = true,
		hideWhileActive = true,
		position = 'top-right',
		offset = 0,
		size = 12,
		color,
		label = 'Start tour',
		class: className,
		portalTarget,
		timeout
	}: Props = $props();

	const spotlight = useSpotlight();
	let element = $state.raw<HTMLElement | null>(null);
	let rect = $state.raw<ElementRect | null>(null);

	$effect(() => {
		if (!active) {
			element = null;
			return;
		}
		const existing = resolveTarget(target);
		if (existing) {
			element = existing;
			return;
		}
		element = null;
		const controller = new AbortController();
		void waitForElement(target, { timeout, signal: controller.signal }).then((el) => {
			if (!controller.signal.aborted) element = el;
		});
		return () => controller.abort();
	});

	$effect(() => {
		const el = element;
		if (!el) {
			rect = null;
			return;
		}
		const update = () => (rect = el.isConnected ? measureElement(el) : null);
		update();
		const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
		observer?.observe(el);
		window.addEventListener('scroll', update, true);
		window.addEventListener('resize', update);
		return () => {
			observer?.disconnect();
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('resize', update);
		};
	});

	const point = $derived.by(() => {
		if (!rect) return null;
		const left = rect.x - offset;
		const right = rect.x + rect.width + offset;
		const top = rect.y - offset;
		const bottom = rect.y + rect.height + offset;
		const cx = rect.x + rect.width / 2;
		const cy = rect.y + rect.height / 2;
		switch (position) {
			case 'top-left':
				return { x: left, y: top };
			case 'top-right':
				return { x: right, y: top };
			case 'bottom-left':
				return { x: left, y: bottom };
			case 'bottom-right':
				return { x: right, y: bottom };
			case 'top':
				return { x: cx, y: top };
			case 'bottom':
				return { x: cx, y: bottom };
			case 'left':
				return { x: left, y: cy };
			case 'right':
				return { x: right, y: cy };
			default:
				return { x: cx, y: cy };
		}
	});

	const visible = $derived(active && point !== null && !(hideWhileActive && spotlight.isActive));

	function handleClick() {
		onclick?.();
		if (tourId) {
			spotlight.start(tourId, stepIndex !== undefined ? { stepIndex } : undefined);
		} else if (highlight) {
			spotlight.highlight({ ...highlight, target: highlight.target ?? target });
		}
	}
</script>

{#if visible && point}
	<button
		type="button"
		class={['tourlight-root', 'tourlight-beacon', className]}
		data-tourlight-theme={themeName(spotlight.options.theme)}
		data-reduced-motion={spotlight.reducedMotion ? '' : undefined}
		data-tourlight-beacon=""
		style={themeStyle(spotlight.options.theme)}
		style:left="{point.x}px"
		style:top="{point.y}px"
		style:--tourlight-beacon-size="{size}px"
		style:--tourlight-beacon={color}
		aria-label={label}
		onclick={handleClick}
		{@attach portal(portalTarget)}
	>
		<span class="tourlight-beacon-dot" aria-hidden="true"></span>
	</button>
{/if}
