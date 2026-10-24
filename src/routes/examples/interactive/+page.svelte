<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { interactive } from '../../../site/code.js';

	const tour = useSpotlight();
	let items = $state<string[]>([]);
	let adding = $state(false);
	let name = $state('');
	let clicks = $state(0);

	const steps: SpotlightStep[] = [
		{
			id: 'add',
			target: '[data-tour="add-item"]',
			title: 'Add your first item',
			content: 'Click the real button to continue. The tour waits for you.',
			advanceOn: { event: 'click' }
		},
		{
			id: 'name',
			target: '[data-tour="name-field"]',
			title: 'Name it',
			content: 'Type a name and press Enter.',
			advanceOn: { event: 'submit' }
		},
		{
			id: 'free',
			target: '[data-tour="playground"]',
			title: 'Play freely',
			content:
				'With interactive: true, input reaches the target but nothing advances until you press Next.',
			interactive: true
		}
	];

	function add(event: SubmitEvent) {
		event.preventDefault();
		if (name.trim()) items = [...items, name.trim()];
		name = '';
		adding = false;
	}
</script>

<SpotlightTour id="interactive" {steps} />

<Example
	title="Interactive steps"
	lede="With advanceOn, a step finishes when the real event fires on its target. The cutout passes real clicks and keys through; nothing is simulated."
	code={interactive}
	codeLabel="advanceOn and interactive"
>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('interactive')}
			>Start interactive tour</button
		>
	</div>
	<div class="mock-app">
		<button type="button" class="btn" data-tour="add-item" onclick={() => (adding = true)}
			>Add item</button
		>
		<form class="inline-form" data-tour="name-field" onsubmit={add}>
			<label class="field">
				<span>Item name</span>
				<input
					bind:value={name}
					disabled={!adding}
					placeholder={adding ? 'Type and press Enter' : 'Press Add item first'}
				/>
			</label>
			<button type="submit" class="btn small" disabled={!adding}>Save</button>
		</form>
		{#if items.length}
			<ul class="list">
				{#each items as item, i (i)}<li>{item}</li>{/each}
			</ul>
		{/if}
		<div class="playground" data-tour="playground">
			<button type="button" class="btn small" onclick={() => clicks++}>Clicked {clicks}×</button>
			<input type="range" aria-label="A slider to play with" />
		</div>
	</div>
</Example>
