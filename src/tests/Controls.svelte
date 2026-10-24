<script lang="ts">
	import { useSpotlight } from '../lib/index.js';
	const tour = useSpotlight();
</script>

<button type="button" id="start" onclick={() => tour.start('demo')}>Start</button>
<button type="button" id="start-2" onclick={() => tour.start('demo', { stepIndex: 1 })}
	>Start at 2</button
>
<output id="state">{tour.activeTourId ?? 'none'}:{tour.currentStep}</output>
