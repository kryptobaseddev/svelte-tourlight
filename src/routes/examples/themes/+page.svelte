<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { themes } from '../../../site/code.js';
	import { site, type ThemeChoice } from '../../../site/state.svelte.js';

	const tour = useSpotlight();
	const choices: { value: ThemeChoice; label: string }[] = [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'auto', label: 'Auto (OS)' },
		{ value: 'custom', label: 'Custom tokens' }
	];
	const steps: SpotlightStep[] = [
		{
			id: 'picker',
			target: '[data-tour="theme-picker"]',
			title: 'Pick a theme',
			content: 'Switch themes while this step is open.',
			interactive: true
		},
		{
			id: 'card',
			target: '[data-tour="theme-card"]',
			title: 'Every value is a variable',
			content: 'Colours, radius, shadow, z-index and duration are CSS custom properties.'
		}
	];
</script>

<SpotlightTour id="themes" {steps} />

<Example
	title="Themes"
	lede="Light, dark, auto (follows prefers-color-scheme) or your own tokens. Defaults sit in :where(), so plain CSS on .tourlight-root always wins."
	code={themes}
	codeLabel="Theming"
>
	<fieldset class="segmented" data-tour="theme-picker">
		<legend>Tour theme</legend>
		{#each choices as c (c.value)}
			<label>
				<input type="radio" name="theme" value={c.value} bind:group={site.theme} />
				<span>{c.label}</span>
			</label>
		{/each}
	</fieldset>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('themes')}
			>Preview theme</button
		>
	</div>
	<div class="mock-app" data-tour="theme-card">
		<p class="muted">The setting applies to every demo on this site until you change it.</p>
	</div>
	<div class="mock-app">
		<h2 class="h3">Using daisyUI or another <code>data-theme</code> system?</h2>
		<p class="muted">
			The overlay root is marked <code>data-tourlight-theme</code>, not <code>data-theme</code>.
			daisyUI switches its themes on <code>[data-theme]</code>, so a dark tour no longer pulls
			daisyUI's dark <code>--color-*</code> values into the overlay. To match your app, map the
			tokens yourself:
			<code>.tourlight-root &#123; --tourlight-primary: var(--color-primary) &#125;</code>.
		</p>
	</div>
</Example>
