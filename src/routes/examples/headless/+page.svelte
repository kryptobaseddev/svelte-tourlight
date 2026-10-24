<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep, type TooltipRenderProps } from '#lib';
	import { createTourStateMachine, generateClipPath, type TourState } from '#lib/core/index.js';
	import Example from '../../../site/Example.svelte';
	import CodeBlock from '../../../site/CodeBlock.svelte';
	import { customTooltip, headless } from '../../../site/code.js';

	const tour = useSpotlight();

	const customSteps: SpotlightStep[] = [
		{
			id: 'c1',
			target: '[data-tour="c-one"]',
			title: 'Your markup',
			content: 'This card is a snippet you write.'
		},
		{
			id: 'c2',
			target: '[data-tour="c-two"]',
			title: 'Same engine',
			content: 'Focus trap, keys, positioning and the bottom sheet still apply.'
		}
	];

	// --- A spotlight built only from svelte-tourlight/core ---
	const coreSteps: SpotlightStep[] = [
		{ id: 'h1', target: '#h-alpha', title: 'Alpha' },
		{ id: 'h2', target: '#h-beta', title: 'Beta' },
		{ id: 'h3', target: '#h-gamma', title: 'Gamma' }
	];
	let box = $state<HTMLDivElement>();
	let coreState = $state<TourState>({ status: 'idle', currentStepIndex: 0, seenSteps: [] });
	let clip = $state('');
	const createMachine = () =>
		createTourStateMachine({ steps: coreSteps, onStateChange: (next) => (coreState = next) });
	let machine = createMachine();

	function startCore() {
		// A fresh machine, so a finished tour restarts from the first step.
		machine = createMachine();
		void machine.start();
	}

	$effect(() => {
		if (!box || coreState.status !== 'active') return;
		const target = box.querySelector<HTMLElement>(
			coreSteps[coreState.currentStepIndex].target as string
		);
		if (!target) return;
		const outer = box.getBoundingClientRect();
		const r = target.getBoundingClientRect();
		// Coordinates relative to the demo box, so the overlay stays inside it.
		clip = generateClipPath(
			{ x: r.x - outer.x, y: r.y - outer.y, width: r.width, height: r.height },
			6,
			10
		);
	});
</script>

{#snippet card(p: TooltipRenderProps)}
	<div class="custom-card">
		<p class="eyebrow">{p.currentIndex + 1} / {p.totalSteps}</p>
		<h2 id={p.titleId}>{p.step.title}</h2>
		<p id={p.contentId}>{p.step.content}</p>
		<div class="actions">
			<button type="button" class="btn small" onclick={p.previous} disabled={p.isFirst}>Back</button
			>
			<button type="button" class="btn small primary" data-tourlight-primary onclick={p.next}>
				{p.isLast ? 'Finish' : 'Next'}
			</button>
		</div>
	</div>
{/snippet}

<SpotlightTour id="custom" steps={customSteps} tooltip={card} />

<Example
	title="Headless & custom UI"
	lede="Replace the tooltip with your own snippet and keep everything else. Or go fully headless with svelte-tourlight/core: the state machine and DOM helpers, no CSS and no components."
	code={customTooltip}
	codeLabel="Custom tooltip snippet"
>
	<h2 class="h3">Custom tooltip</h2>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('custom')}
			>Start custom tour</button
		>
	</div>
	<div class="grid-2">
		<div class="mock-app" data-tour="c-one"><p class="muted">Card one</p></div>
		<div class="mock-app" data-tour="c-two"><p class="muted">Card two</p></div>
	</div>

	<h2 class="h3">Bare core</h2>
	<div class="core-box" bind:this={box}>
		<div class="chips">
			<span class="pill" id="h-alpha">Alpha</span>
			<span class="pill" id="h-beta">Beta</span>
			<span class="pill" id="h-gamma">Gamma</span>
		</div>
		{#if coreState.status === 'active'}
			<div class="core-overlay" style:clip-path={clip} aria-hidden="true"></div>
		{/if}
		<p class="core-status" role="status">
			{coreState.status === 'active'
				? `Step ${coreState.currentStepIndex + 1}: ${coreSteps[coreState.currentStepIndex].title}`
				: coreState.status === 'completed'
					? 'Completed.'
					: 'Idle.'}
		</p>
		<div class="actions">
			{#if coreState.status !== 'active'}
				<button type="button" class="btn small primary" onclick={startCore}>Start</button>
			{:else}
				<button type="button" class="btn small" onclick={() => machine.previous()}>Back</button>
				<button type="button" class="btn small primary" onclick={() => machine.next()}>Next</button>
				<button type="button" class="btn small" onclick={() => machine.stop()}>Stop</button>
			{/if}
		</div>
	</div>
	{#snippet notes()}
		<CodeBlock code={headless} label="svelte-tourlight/core" />
	{/snippet}
</Example>
