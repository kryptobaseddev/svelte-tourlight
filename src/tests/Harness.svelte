<script lang="ts">
	import {
		SpotlightProvider,
		SpotlightTour,
		SpotlightBeacon,
		type SpotlightStep,
		type TourEvent,
		type TourlightOptions
	} from '../lib/index.js';
	import Controls from './Controls.svelte';

	interface Props extends TourlightOptions {
		steps: SpotlightStep[];
		beacon?: boolean;
		tabbar?: boolean;
		/** Render a #tall block taller than any test viewport. */
		tall?: boolean;
		log?: TourEvent[];
	}

	let {
		steps,
		beacon = false,
		tabbar = false,
		tall = false,
		log = [],
		...options
	}: Props = $props();
	let clicks = $state(0);
</script>

<SpotlightProvider {...options} onEvent={(e) => log.push(e)}>
	<SpotlightTour id="demo" {steps} />
	<main>
		<button id="first" type="button">First</button>
		<p style="height: 40px">filler</p>
		<button id="second" type="button" onclick={() => clicks++}>Second ({clicks})</button>
		<input id="field" aria-label="Field" />
		<Controls />
		{#if tall}
			<div id="tall" style="height: 2000px">Tall</div>
		{/if}
	</main>
	{#if tabbar}
		<nav id="tabbar" aria-label="Tabs" style="position: fixed; inset: auto 0 0 0; height: 56px">
			Tabs
		</nav>
	{/if}
	{#if beacon}
		<SpotlightBeacon target="#first" tour="demo" label="Show tips" />
	{/if}
</SpotlightProvider>
