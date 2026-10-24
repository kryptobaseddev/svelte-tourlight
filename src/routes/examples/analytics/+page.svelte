<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { analytics } from '../../../site/code.js';
	import { site } from '../../../site/state.svelte.js';

	const tour = useSpotlight();
	const steps: SpotlightStep[] = [
		{
			id: 'an-one',
			target: '[data-tour="an-log"]',
			title: 'Events stream in',
			content: 'Each action appears in the log.'
		},
		{
			id: 'an-missing',
			target: '#does-not-exist',
			title: 'Never shown',
			content: '',
			timeout: 800
		},
		{
			id: 'an-two',
			target: '[data-tour="an-start"]',
			title: 'Missing targets',
			content: 'The step before had no target, so it was skipped and reported as target-missing.'
		}
	];
</script>

<SpotlightTour id="analytics" {steps} />

<Example
	title="Analytics"
	lede="One onEvent stream covers start, step, complete, skip, stop, target-missing, highlight and error. A step event fires once per step, only after its target was found."
	code={analytics}
	codeLabel="Callbacks"
>
	<div class="actions">
		<button
			type="button"
			class="btn primary"
			data-tour="an-start"
			onclick={() => tour.start('analytics')}>Start tour</button
		>
		<button type="button" class="btn" onclick={() => (site.events = [])}>Clear log</button>
	</div>
	<div class="mock-app" data-tour="an-log">
		<h2 class="h3">Live event log</h2>
		{#if site.events.length}
			<ol class="log">
				{#each site.events as e, i (i)}
					<li><time>{e.at}</time> <code>{e.text}</code></li>
				{/each}
			</ol>
		{:else}
			<p class="muted">No events yet. Events from every demo on this site land here.</p>
		{/if}
	</div>
</Example>
