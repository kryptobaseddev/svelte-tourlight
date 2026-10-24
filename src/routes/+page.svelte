<script lang="ts">
	import { resolve } from '$app/paths';
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import { examples } from '../site/nav.js';
	import CodeBlock from '../site/CodeBlock.svelte';
	import { install } from '../site/code.js';

	const tour = useSpotlight();

	const steps: SpotlightStep[] = [
		{
			id: 'hello',
			title: 'This is svelte-tourlight',
			content:
				'Everything on this site runs the real library. This is a centered step with no target.'
		},
		{
			id: 'features',
			target: '[data-tour="features"]',
			title: 'One page per feature',
			content: 'Each example has a live demo, a short explanation and code you can copy.'
		},
		{
			id: 'start',
			target: '[data-tour="get-started"]',
			title: 'Ready?',
			content: 'Getting started takes about five lines in your root layout.'
		}
	];
</script>

<svelte:head>
	<title>svelte-tourlight · Product tours for Svelte 5</title>
	<meta
		name="description"
		content="Spotlight product tours for Svelte 5: multi-page, survive reloads, click-the-real-button steps, beacons, accessible, JSON tours."
	/>
</svelte:head>

<SpotlightTour id="home" {steps} />

<section class="hero">
	<p class="eyebrow">Svelte 5 · runes · MIT</p>
	<h1>Product tours for Svelte 5</h1>
	<p class="lede">
		A spotlight cutout, steps that follow you across pages and survive reloads, steps you finish by
		clicking the real button, pulsing hint dots, keyboard and screen-reader support, and tours
		written as JSON.
	</p>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('home')}
			>Take the tour</button
		>
		<a class="btn" href={resolve('/getting-started')} data-tour="get-started">Get started</a>
	</div>
	<CodeBlock code={install} label="Install" />
</section>

<section aria-labelledby="features-title" data-tour="features">
	<h2 id="features-title">Examples</h2>
	<ul class="cards">
		{#each examples as item (item.href)}
			<li>
				<a class="card-link" href={resolve(item.href)}>
					<span class="card-title">{item.label}</span>
					<span class="card-blurb">{item.blurb}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
