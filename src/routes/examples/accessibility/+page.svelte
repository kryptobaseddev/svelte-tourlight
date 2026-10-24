<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { accessibility } from '../../../site/code.js';

	const tour = useSpotlight();
	let heard = $state<string[]>([]);

	const steps: SpotlightStep[] = [
		{
			id: 'a-keys',
			target: '[data-tour="a-keys"]',
			title: 'Use the keyboard',
			content: 'Press → for next, ← for back, Esc to skip.'
		},
		{
			id: 'a-focus',
			target: '[data-tour="a-focus"]',
			title: 'Focus is managed',
			content:
				'Focus starts on Next, stays in the tooltip, and returns to the button that started the tour.'
		},
		{
			id: 'a-live',
			target: '[data-tour="a-live"]',
			title: 'Announced',
			content: 'Each step is read out through a polite live region.'
		}
	];

	// Mirror the provider's live region so sighted visitors can see what is announced.
	$effect(() => {
		const region = document.querySelector('.tourlight-portal [aria-live]');
		if (!region) return;
		const observer = new MutationObserver(() => {
			const text = region.textContent?.trim();
			if (text) heard = [text, ...heard].slice(0, 6);
		});
		observer.observe(region, { childList: true, characterData: true, subtree: true });
		return () => observer.disconnect();
	});
</script>

<SpotlightTour id="a11y" {steps} />

<Example
	title="Keyboard & screen readers"
	lede="The tooltip is a labelled dialog with a focus trap. The rest of the page is inert, keys work as expected, and every step is announced. Buttons are at least 44px."
	code={accessibility}
	codeLabel="Accessibility and labels"
>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('a11y')}
			>Start with the keyboard</button
		>
	</div>
	<div class="grid-2">
		<div class="mock-app" data-tour="a-keys">
			<h2 class="h3">Keys</h2>
			<dl class="keys">
				<dt><kbd>→</kbd></dt>
				<dd>Next step</dd>
				<dt><kbd>←</kbd></dt>
				<dd>Previous step</dd>
				<dt><kbd>Esc</kbd></dt>
				<dd>Skip the tour</dd>
				<dt><kbd>Tab</kbd></dt>
				<dd>Move between tooltip buttons (and the target on interactive steps)</dd>
			</dl>
		</div>
		<div class="mock-app" data-tour="a-focus">
			<h2 class="h3">Focus and inert</h2>
			<p class="muted">
				While a step shows, everything outside the tour is <code>inert</code>. On interactive steps
				the target stays reachable.
			</p>
		</div>
	</div>
	<div class="mock-app" data-tour="a-live">
		<h2 class="h3">What a screen reader hears</h2>
		{#if heard.length}
			<ol class="list">
				{#each heard as h, i (i)}<li>{h}</li>{/each}
			</ol>
		{:else}
			<p class="muted">Start the tour to see the announcements.</p>
		{/if}
	</div>
</Example>
