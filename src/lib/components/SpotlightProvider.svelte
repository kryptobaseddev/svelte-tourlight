<script lang="ts">
	import '../styles.css';
	import { onMount, type Snippet } from 'svelte';
	import { Tourlight, setTourlightContext, type TourlightOptions } from '../controller.svelte.js';
	import { createKeyboardHandler } from '../core/keyboard.js';
	import { getStepAriaLabel, setInert } from '../core/a11y.js';
	import type { TooltipRenderProps } from '../core/types.js';
	import { themeName, themeStyle } from '../themes.js';
	import { portal, type PortalTarget } from './portal.js';
	import SpotlightOverlay from './SpotlightOverlay.svelte';
	import SpotlightTooltip from './SpotlightTooltip.svelte';

	interface Props extends TourlightOptions {
		children?: Snippet;
		/** Where the overlay mounts. Default `document.body`. */
		portalTarget?: PortalTarget;
		/** Replace the tooltip body for every tour (a tour's own `tooltip` wins). */
		tooltip?: Snippet<[TooltipRenderProps]>;
		/** Extra content under every step's body. */
		footer?: Snippet<[TooltipRenderProps]>;
		/** Bring your own controller, for example to drive tours from outside the tree. */
		controller?: Tourlight;
	}

	let { children, portalTarget, tooltip, footer, controller, ...options }: Props = $props();

	// The controller is created once; later props reach it through the getter.
	// svelte-ignore state_referenced_locally
	const tour = controller ?? new Tourlight(() => options);
	setTourlightContext(tour);

	let mounted = $state(false);
	let wrapper = $state<HTMLDivElement>();

	onMount(() => {
		mounted = true;
		return () => tour.destroy();
	});

	const step = $derived(tour.step);
	const isHighlight = $derived(tour.highlightStep !== null);
	const index = $derived(isHighlight ? 0 : tour.currentStep);
	const total = $derived(isHighlight ? 1 : tour.totalSteps);
	const centered = $derived(!!step && !step.target);
	const ready = $derived(!!step && (centered || tour.targetElement !== null));
	const announcement = $derived(step && ready ? getStepAriaLabel(index, total, step.title) : '');

	// Arrow keys and Escape while anything is showing.
	$effect(() => {
		if (!tour.isActive) return;
		const handler = createKeyboardHandler({
			onNext: () => (tour.highlightStep ? tour.dismissHighlight() : tour.next()),
			onPrevious: () => tour.previous(),
			onDismiss: () => (tour.highlightStep ? tour.dismissHighlight() : tour.skip()),
			escToDismiss: tour.options.escToDismiss ?? true
		});
		handler.attach();
		return handler.detach;
	});

	// Everything outside the tour UI is inert; the target stays live on interactive steps.
	$effect(() => {
		if (!tour.isActive || !wrapper) return;
		return setInert(wrapper, tour.isInteractive ? tour.targetElement : null);
	});

	// advanceOn: the real event on the target moves the tour forward.
	$effect(() => {
		const advanceOn = tour.highlightStep ? undefined : step?.advanceOn;
		const target = tour.targetElement;
		if (!advanceOn || !target) return;
		const handler = (event: Event) => {
			if (advanceOn.selector) {
				if (!(event.target instanceof Element)) return;
				let matched: Element | null;
				try {
					matched = event.target.closest(advanceOn.selector);
				} catch {
					return;
				}
				if (!matched || !target.contains(matched)) return;
			}
			tour.next();
		};
		// Capture phase so non-bubbling events (focus, blur) can delegate too.
		target.addEventListener(advanceOn.event, handler, true);
		return () => target.removeEventListener(advanceOn.event, handler, true);
	});
</script>

{@render children?.()}

{#if mounted}
	<div bind:this={wrapper} class="tourlight-portal" {@attach portal(portalTarget)}>
		<div class="tourlight-sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
		{#if tour.isActive && step}
			<div
				class="tourlight-root"
				data-theme={themeName(tour.options.theme)}
				data-reduced-motion={tour.reducedMotion ? '' : undefined}
				style={themeStyle(tour.options.theme)}
			>
				<SpotlightOverlay
					rect={centered ? null : tour.targetRect}
					radius={step.spotlightRadius ?? 8}
					interactive={tour.isInteractive}
					loading={!ready}
					onclick={tour.overlayClick}
				/>
				{#if !ready}
					<div class="tourlight-loading" role="status">
						<span class="tourlight-sr-only"
							>{tour.options.labels?.loading ?? 'Loading tour step…'}</span
						>
					</div>
				{:else}
					<SpotlightTooltip
						{step}
						target={centered ? null : tour.targetElement}
						currentIndex={index}
						totalSteps={total}
						{isHighlight}
						sheet={tour.isSheet}
						interactive={tour.isInteractive}
						showProgress={tour.options.showProgress ?? true}
						showSkip={tour.options.showSkip ?? true}
						labels={tour.options.labels}
						next={isHighlight ? tour.dismissHighlight : tour.next}
						previous={tour.previous}
						skip={isHighlight ? tour.dismissHighlight : tour.skip}
						close={isHighlight ? tour.dismissHighlight : tour.stop}
						onError={(error) => {
							if (isHighlight) tour.dismissHighlight();
							else tour.stop();
							tour.options.onError?.(error, tour.activeTourId);
						}}
						tooltip={tour.tourTooltip ?? tooltip}
						{footer}
					/>
				{/if}
			</div>
		{/if}
	</div>
{/if}
