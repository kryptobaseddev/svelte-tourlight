<script lang="ts">
	import { resolve } from '$app/paths';
	import Example from '../../../site/Example.svelte';
	import { mobile } from '../../../site/code.js';

	let position = $state<'auto' | 'top' | 'bottom'>('auto');
	const src = $derived(`${resolve('/examples/mobile/frame')}?sheet=${position}`);
</script>

<Example
	title="Phone bottom sheet"
	lede="Below 640px the tooltip becomes a sheet: full width, safe-area padding, at most 45% of the screen. It docks at the bottom, or at the top when the target sits low (like a fixed tab bar), so the sheet never covers it."
	code={mobile}
	codeLabel="sheetPosition and mobileBreakpoint"
>
	<fieldset class="segmented">
		<legend>sheetPosition</legend>
		{#each [['auto', 'Auto'], ['top', 'Top'], ['bottom', 'Bottom']] as [value, label] (value)}
			<label>
				<input type="radio" name="sheet" {value} bind:group={position} />
				<span>{label}</span>
			</label>
		{/each}
	</fieldset>
	<p class="muted">
		The frame is a 360px-wide page running the same library. Start its tour: step 3 targets the
		fixed tab bar. In auto mode the sheet moves to the top for that step.
	</p>
	<div class="phone">
		<iframe title="Phone-sized demo of the sheet" {src} loading="lazy"></iframe>
	</div>
</Example>
