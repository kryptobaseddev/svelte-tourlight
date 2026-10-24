<script lang="ts">
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import Example from '../../../site/Example.svelte';
	import { basic } from '../../../site/code.js';

	const tour = useSpotlight();
	const steps: SpotlightStep[] = [
		{ id: 'welcome', title: 'Welcome', content: 'A step with no target is centered on screen.' },
		{
			id: 'search',
			target: '[data-tour="search"]',
			title: 'Search',
			content: 'Find any project or person.'
		},
		{
			id: 'new',
			target: '[data-tour="new"]',
			title: 'Create',
			content: 'Start a new project from here.'
		},
		{
			id: 'profile',
			target: '[data-tour="profile"]',
			title: 'Your profile',
			content: 'Settings and sign-out.'
		}
	];
</script>

<SpotlightTour id="basic" {steps} />

<Example
	title="Basic tour"
	lede="Register steps with SpotlightTour, then start it from anywhere with useSpotlight(). Jump straight to any step with stepIndex."
	code={basic}
	codeLabel="Basic tour"
>
	<div class="actions">
		<button type="button" class="btn primary" onclick={() => tour.start('basic')}>Start tour</button
		>
		<button type="button" class="btn" onclick={() => tour.start('basic', { stepIndex: 2 })}
			>Start at step 3</button
		>
	</div>
	<div class="mock-app">
		<div class="mock-bar">
			<input
				class="mock-input"
				placeholder="Search projects"
				aria-label="Search projects"
				data-tour="search"
			/>
			<button type="button" class="btn small primary" data-tour="new">New project</button>
			<span class="avatar" data-tour="profile" role="img" aria-label="Profile">KB</span>
		</div>
		<p class="muted">
			{tour.activeTourId === 'basic'
				? `Showing step ${tour.currentStep + 1} of ${tour.totalSteps}`
				: 'No tour running.'}
		</p>
	</div>
</Example>
