<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		arrow,
		autoUpdate,
		computePosition,
		flip,
		offset,
		shift,
		type Placement as FloatingPlacement
	} from '@floating-ui/dom';
	import { createFocusTrap } from '../core/a11y.js';
	import { runCallback } from '../core/callback.js';
	import type { SpotlightLabels, SpotlightStep, TooltipRenderProps } from '../core/types.js';

	interface Props {
		step: SpotlightStep;
		/** The spotlighted element; null for a centered step. */
		target: HTMLElement | null;
		currentIndex: number;
		totalSteps: number;
		isHighlight: boolean;
		/** Render as a sheet docked to this edge, or float when null. */
		sheet: 'top' | 'bottom' | null;
		interactive: boolean;
		showProgress: boolean;
		showSkip: boolean;
		labels?: SpotlightLabels;
		next: () => void;
		previous: () => void;
		skip: () => void;
		close: () => void;
		onError: (error: unknown) => void;
		/** Replaces the whole tooltip body. */
		tooltip?: Snippet<[TooltipRenderProps]>;
		/** Extra content under the body, for example a "Don't show tours again" checkbox. */
		footer?: Snippet<[TooltipRenderProps]>;
	}

	let {
		step,
		target,
		currentIndex,
		totalSteps,
		isHighlight,
		sheet,
		interactive,
		showProgress,
		showSkip,
		labels,
		next,
		previous,
		skip,
		close,
		onError,
		tooltip,
		footer
	}: Props = $props();

	const uid = $props.id();
	const titleId = `${uid}-title`;
	const contentId = `${uid}-content`;

	let el = $state<HTMLDivElement>();
	let arrowEl = $state<HTMLDivElement>();
	let shown = $state(false);
	let side = $state<'top' | 'bottom' | 'left' | 'right'>('bottom');

	const centered = $derived(!target);
	const floating = $derived(!!target && !sheet);
	const isFirst = $derived(currentIndex === 0);
	const isLast = $derived(currentIndex === totalSteps - 1);
	const progress = $derived(totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0);

	const text = $derived({
		next: labels?.next ?? 'Next',
		previous: labels?.previous ?? 'Back',
		skip: labels?.skip ?? 'Skip tour',
		done: labels?.done ?? 'Done',
		close: labels?.close ?? 'Close tour',
		stepOf: labels?.stepOf
			? labels.stepOf(currentIndex + 1, totalSteps)
			: `Step ${currentIndex + 1} of ${totalSteps}`
	});

	const renderProps: TooltipRenderProps = $derived({
		step,
		next,
		previous,
		skip,
		close,
		currentIndex,
		totalSteps,
		isFirst,
		isLast,
		isHighlight,
		titleId,
		contentId
	});

	function runAction() {
		runCallback(step.action?.onClick, onError);
	}

	// Enter animation: re-run whenever the step changes.
	$effect(() => {
		void step;
		shown = false;
		const frame = requestAnimationFrame(() => (shown = true));
		return () => cancelAnimationFrame(frame);
	});

	// Floating UI positioning against the live target.
	$effect(() => {
		if (!el || !target || !floating) return;
		const floatingEl = el;
		const reference = target;
		const placement =
			step.placement && step.placement !== 'auto'
				? (step.placement as FloatingPlacement)
				: 'bottom';
		const arrowNode = arrowEl;
		return autoUpdate(reference, floatingEl, () => {
			void computePosition(reference, floatingEl, {
				strategy: 'fixed',
				placement,
				middleware: [
					offset(14),
					flip({ padding: 8 }),
					// crossAxis: when the target is taller (or wider) than the viewport, neither
					// side fits; slide the popover over the target so its buttons stay on screen.
					shift({ padding: 8, crossAxis: true }),
					...(arrowNode ? [arrow({ element: arrowNode, padding: 12 })] : [])
				]
			}).then(({ x, y, placement: final, middlewareData }) => {
				floatingEl.style.left = `${x}px`;
				floatingEl.style.top = `${y}px`;
				side = final.split('-')[0] as typeof side;
				if (arrowNode && middlewareData.arrow) {
					const { x: ax, y: ay } = middlewareData.arrow;
					arrowNode.style.left = ax != null ? `${ax}px` : '';
					arrowNode.style.top = ay != null ? `${ay}px` : '';
				}
			});
		});
	});

	// Clear inline coordinates when switching to sheet or centered layout.
	$effect(() => {
		if (el && !floating) {
			el.style.left = '';
			el.style.top = '';
		}
	});

	// Trap focus in the tooltip (plus the target on interactive steps).
	$effect(() => {
		if (!el) return;
		void step;
		const trap = createFocusTrap(el, interactive ? target : null);
		trap.activate();
		return () => trap.deactivate();
	});
</script>

<div
	bind:this={el}
	class="tourlight-tooltip"
	role="dialog"
	aria-modal={interactive ? undefined : 'true'}
	aria-labelledby={tooltip ? undefined : titleId}
	aria-describedby={tooltip ? undefined : contentId}
	aria-label={tooltip ? step.title : undefined}
	data-shown={shown ? '' : undefined}
	data-sheet={sheet ?? undefined}
	data-centered={centered && !sheet ? '' : undefined}
	data-side={side}
>
	{#if tooltip}
		{@render tooltip(renderProps)}
	{:else}
		<button type="button" class="tourlight-close" aria-label={text.close} onclick={close}>
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
				<path
					d="M1 1L13 13M1 13L13 1"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<h2 id={titleId} class="tourlight-title">{step.title}</h2>
		<div id={contentId} class="tourlight-content">
			{#if typeof step.content === 'function'}
				{@render step.content()}
			{:else if step.content}
				<p>{step.content}</p>
			{/if}
		</div>
		{#if step.action}
			<button
				type="button"
				class="tourlight-button tourlight-button--secondary tourlight-action"
				onclick={runAction}
			>
				{step.action.label}
			</button>
		{/if}
		{#if footer}
			<div class="tourlight-footer">{@render footer(renderProps)}</div>
		{/if}
		{#if showProgress && !isHighlight && totalSteps > 1}
			<div class="tourlight-progress" aria-hidden="true">
				<div class="tourlight-progress-bar" style:width="{progress}%"></div>
			</div>
		{/if}
		<div class="tourlight-buttons">
			{#if !isHighlight}
				<span class="tourlight-step-info">{text.stepOf}</span>
			{/if}
			{#if showSkip && !isHighlight && !isLast}
				<button type="button" class="tourlight-button tourlight-button--secondary" onclick={skip}
					>{text.skip}</button
				>
			{/if}
			{#if !isFirst && !isHighlight}
				<button
					type="button"
					class="tourlight-button tourlight-button--secondary"
					onclick={previous}>{text.previous}</button
				>
			{/if}
			<button
				type="button"
				class="tourlight-button tourlight-button--primary"
				data-tourlight-primary
				onclick={next}
			>
				{isLast || isHighlight ? text.done : text.next}
			</button>
		</div>
	{/if}
	{#if floating}
		<div bind:this={arrowEl} class="tourlight-arrow" data-side={side} aria-hidden="true"></div>
	{/if}
</div>
