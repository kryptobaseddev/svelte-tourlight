<script lang="ts">
	import { useSpotlight, SpotlightBeacon } from 'svelte-tourlight';
	const tour = useSpotlight();
</script>

<button id="go" onclick={() => tour.start('t')}>Start</button>
<SpotlightBeacon target="#go" tour="t" />
