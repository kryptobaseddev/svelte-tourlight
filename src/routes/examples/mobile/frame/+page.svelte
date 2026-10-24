<script lang="ts">
	import { onMount } from 'svelte';
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import { site } from '../../../../site/state.svelte.js';

	const tour = useSpotlight();
	const steps: SpotlightStep[] = [
		{
			id: 'm-hello',
			title: 'Hi from a phone',
			content: 'Tooltips dock as a sheet on small screens.'
		},
		{
			id: 'm-search',
			target: '[data-tour="m-search"]',
			title: 'Search',
			content: 'The target stays visible above the sheet.'
		},
		{
			id: 'm-tabs',
			target: '[data-tour="m-tabs"]',
			title: 'A fixed tab bar',
			content:
				'This target can’t scroll, so in auto mode the sheet docks at the top instead of covering it.'
		}
	];

	// The parent page picks the dock with ?sheet=auto|top|bottom. Read it in the browser,
	// because prerendered pages can't read query strings.
	onMount(() => {
		const value = new URLSearchParams(location.search).get('sheet');
		if (value === 'top' || value === 'bottom' || value === 'auto') site.sheetPosition = value;
	});
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
</main>
<nav class="tabbar" aria-label="App sections" data-tour="m-tabs">
	<button type="button" aria-current="page">Inbox</button>
	<button type="button">Search</button>
	<button type="button">Settings</button>
</nav>
