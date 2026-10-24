<script lang="ts">
	import { resolve } from '$app/paths';
	import { useSpotlight } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { multiPage } from '../../../site/code.js';

	const tour = useSpotlight();
</script>

<Example
	title="Multi-page tour"
	lede="Steps name a route. The provider navigates for you and, with persist, a reload resumes the same step."
	code={multiPage}
	codeLabel="Route-aware steps"
>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('multi-page')}
			>Start multi-page tour</button
		>
		<a class="btn" href={resolve('/examples/multi-page/second')}>Go to page two</a>
	</div>
	<div class="mock-app">
		<h2 class="h3">Page one</h2>
		<p class="muted" data-tour="mp-first">This paragraph is step two's target.</p>
		<p class="muted" data-tour="mp-done">Step four comes back here.</p>
	</div>
	{#snippet notes()}
		<p>
			Try it: start the tour, press Next until it moves to page two, then reload the browser. The
			step reappears because the provider uses <code>persist={'{sessionStorage}'}</code>.
		</p>
	{/snippet}
</Example>
