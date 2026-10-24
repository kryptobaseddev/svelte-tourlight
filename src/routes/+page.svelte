<script lang="ts">
	import { SpotlightBeacon, SpotlightHighlight, useSpotlight } from '#lib';
	import { demo } from './demo-state.svelte.js';

	const tour = useSpotlight();
	let count = $state(0);
	let showNew = $state(false);

	const themes = ['auto', 'light', 'dark', 'custom'] as const;
</script>

<svelte:head>
	<title>svelte-tourlight · Svelte 5 product tours</title>
	<meta
		name="description"
		content="Spotlight product tours for Svelte 5, inspired by react-tourlight."
	/>
</svelte:head>

<main class="page">
	<section class="hero">
		<h1>Product tours for Svelte 5</h1>
		<p class="lede">
			A spotlight cutout, steps that follow you across pages and survive reloads, steps you finish
			by clicking the real button, pulsing hint dots, keyboard and screen-reader support, and tours
			written as JSON.
		</p>
		<div class="actions">
			<button
				type="button"
				class="btn primary"
				data-tour="start"
				onclick={() => tour.start('welcome')}>Start the tour</button
			>
			<button type="button" class="btn" onclick={() => tour.start('welcome', { stepIndex: 3 })}
				>Jump to step 4</button
			>
		</div>
	</section>

	<section class="grid">
		<article class="card">
			<h2>Theme</h2>
			<div class="segmented" role="radiogroup" aria-label="Tour theme" data-tour="theme">
				{#each themes as t (t)}
					<label>
						<input type="radio" name="theme" value={t} bind:group={demo.theme} />
						<span>{t}</span>
					</label>
				{/each}
			</div>
		</article>

		<article class="card">
			<h2>Interactive step</h2>
			<p>The tour waits for a real click here.</p>
			<button type="button" class="btn" data-tour="counter" onclick={() => count++}
				>Clicked {count} times</button
			>
		</article>

		<article class="card">
			<h2>Beacon</h2>
			<p>
				A pulsing dot invites people in instead of interrupting them.
				<span class="anchor" id="beacon-anchor">Export</span>
			</p>
			<SpotlightBeacon
				target="#beacon-anchor"
				label="What does Export do?"
				highlight={{ title: 'Export', content: 'A one-off highlight, started from a beacon.' }}
			/>
		</article>

		<article class="card">
			<h2>One-off highlight</h2>
			<p>Spotlight a single element for a "what's new" note.</p>
			<button type="button" class="btn" id="whats-new" onclick={() => (showNew = true)}
				>Show what's new</button
			>
			<SpotlightHighlight
				active={showNew}
				target="#whats-new"
				title="New: highlights"
				content="Highlights use the same spotlight without a full tour."
				onDismiss={() => (showNew = false)}
			/>
		</article>
	</section>

	<section class="card log" aria-labelledby="log-title">
		<h2 id="log-title">Analytics events</h2>
		{#if demo.events.length}
			<ol>
				{#each demo.events as e, i (i)}<li><code>{e}</code></li>{/each}
			</ol>
		{:else}
			<p>No events yet. Start the tour to see <code>onEvent</code> fire.</p>
		{/if}
	</section>
</main>
