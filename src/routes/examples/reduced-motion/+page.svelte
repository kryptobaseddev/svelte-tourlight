<script lang="ts">
	import { SpotlightBeacon, SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { reducedMotion } from '../../../site/code.js';
	import { site } from '../../../site/state.svelte.js';

	const tour = useSpotlight();
	const mode = $derived(
		site.reducedMotion === undefined ? 'system' : site.reducedMotion ? 'on' : 'off'
	);
	const steps: SpotlightStep[] = [
		{
			id: 'rm-top',
			target: '[data-tour="rm-top"]',
			title: 'Watch the motion',
			content: 'Compare the tooltip and cutout with reduced motion on and off.'
		},
		{
			id: 'rm-far',
			target: '[data-tour="rm-far"]',
			title: 'Scrolling',
			content: 'With reduced motion the page jumps instead of smooth-scrolling.'
		}
	];

	function setMode(value: string) {
		site.reducedMotion = value === 'system' ? undefined : value === 'on';
	}
</script>

<SpotlightTour id="motion" {steps} />

<Example
	title="Reduced motion"
	lede="When the OS asks for reduced motion (or you force it), there are no tooltip or cutout tweens, no smooth scrolling and no beacon pulse."
	code={reducedMotion}
	codeLabel="reducedMotion"
>
	<fieldset class="segmented">
		<legend>Reduced motion</legend>
		{#each [['system', 'Follow OS'], ['on', 'On'], ['off', 'Off']] as [value, label] (value)}
			<label>
				<input
					type="radio"
					name="rm"
					{value}
					checked={mode === value}
					onchange={() => setMode(value)}
				/>
				<span>{label}</span>
			</label>
		{/each}
	</fieldset>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('motion')}
			>Start tour</button
		>
	</div>
	<div class="mock-app" data-tour="rm-top">
		<p class="muted">The beacon on this card stops pulsing when reduced motion is on.</p>
		<span class="pill" id="rm-beacon">Beacon</span>
	</div>
	<div class="spacer" aria-hidden="true"></div>
	<div class="mock-app" data-tour="rm-far">
		<p class="muted">A target further down the page.</p>
	</div>
	<SpotlightBeacon
		target="#rm-beacon"
		label="Beacon demo"
		highlight={{ title: 'Beacon', content: 'Pulse follows the motion setting.' }}
	/>
</Example>
