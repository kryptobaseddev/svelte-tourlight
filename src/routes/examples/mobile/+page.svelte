<script lang="ts">
	import { resolve } from '$app/paths';
	import Example from '../../../site/Example.svelte';
	import { mobile } from '../../../site/code.js';
</script>

<Example
	title="Phone bottom sheet"
	lede="Below 640px the tooltip becomes a bottom sheet: full width, safe-area padding, at most 45% of the screen, and the target scrolls into the space above it."
	code={mobile}
	codeLabel="mobileBreakpoint"
>
	<p class="muted">
		The frame below is a 360px-wide page running the same library. On a phone, any demo on this site
		uses the sheet.
	</p>
	<div class="phone">
		<iframe
			title="Phone-sized demo of the bottom sheet"
			src={resolve('/examples/mobile/frame')}
			loading="lazy"
		></iframe>
	</div>
</Example>
