<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';

	const tour = useSpotlight();
	const steps: SpotlightStep[] = [
		{
			id: 'm-hello',
			title: 'Hi from a phone',
			content: 'Tooltips dock to the bottom on small screens.'
		},
		{
			id: 'm-search',
			target: '[data-tour="m-search"]',
			title: 'Search',
			content: 'The target stays visible above the sheet.'
		},
		{
			id: 'm-fab',
			target: '[data-tour="m-fab"]',
			title: 'Low on the page',
			content: 'Targets near the bottom are scrolled up out of the sheet’s way.'
		}
	];
</script>

<svelte:head><title>Phone frame · svelte-tourlight</title></svelte:head>

<SpotlightTour id="mobile" {steps} />

<main class="frame">
	<header class="frame-bar">
		<strong>Inbox</strong>
		<input aria-label="Search mail" placeholder="Search" data-tour="m-search" />
	</header>
	<button type="button" class="btn primary block" onclick={() => tour.start('mobile')}
		>Start phone tour</button
	>
	<ul class="list">
		{#each Array.from({ length: 12 }, (_, i) => i + 1) as n (n)}
			<li>Message {n}</li>
		{/each}
	</ul>
	<button type="button" class="btn primary block" data-tour="m-fab">Compose</button>
</main>
