<script lang="ts">
	import {
		SpotlightBeacon,
		SpotlightHighlight,
		SpotlightTour,
		useSpotlight,
		type SpotlightStep
	} from '#lib';
	import Example from '../../../site/Example.svelte';
	import { beacons } from '../../../site/code.js';

	const tour = useSpotlight();
	let showNew = $state(false);

	const reportsSteps: SpotlightStep[] = [
		{
			id: 'reports',
			target: '#reports',
			title: 'Reports',
			content: 'Weekly numbers, ready to share.'
		},
		{ id: 'export', target: '#export', title: 'Export', content: 'Download any report as CSV.' }
	];
</script>

<SpotlightTour id="reports-tour" steps={reportsSteps} />

<Example
	title="Beacons & highlights"
	lede="Beacons are pulsing dots that invite people in instead of interrupting them. Highlights spotlight one element without a full tour."
	code={beacons}
	codeLabel="Beacons and highlights"
>
	<div class="mock-app">
		<div class="mock-bar">
			<span class="pill" id="reports">Reports</span>
			<span class="pill" id="export">Export</span>
			<span class="pill" id="inbox">Inbox</span>
		</div>
		<p class="muted">
			Each dot has a 44px hit area. Beacons hide while a tour or highlight is showing.
		</p>
		<div class="actions">
			<button type="button" class="btn" onclick={() => (showNew = true)}
				>Declarative highlight</button
			>
			<button
				type="button"
				class="btn"
				onclick={() =>
					tour.highlight({
						target: '#inbox',
						title: 'Inbox',
						content: 'Started with tour.highlight(step).'
					})}
			>
				Imperative highlight
			</button>
		</div>
	</div>
	<SpotlightBeacon target="#reports" tour="reports-tour" label="Take the reports tour" />
	<SpotlightBeacon
		target="#export"
		position="top-left"
		label="What does Export do?"
		highlight={{ title: 'Export', content: 'A one-off highlight, opened from a beacon.' }}
	/>
	<SpotlightHighlight
		active={showNew}
		target="#inbox"
		title="New: Inbox"
		content="Shown by SpotlightHighlight while active is true."
		onDismiss={() => (showNew = false)}
	/>
</Example>
