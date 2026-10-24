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
		log?: TourEvent[];
	}

	let { steps, beacon = false, log = [], ...options }: Props = $props();
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
	</main>
	{#if beacon}
		<SpotlightBeacon target="#first" tour="demo" label="Show tips" />
	{/if}
</SpotlightProvider>
