<script lang="ts">
	import { goto } from '$app/navigation';
	import { SpotlightProvider, SpotlightTour, type SpotlightStep } from 'svelte-tourlight';
	import { compileTourDocument, validateTourDocument } from 'svelte-tourlight/document';
	import { isRouteActive } from 'svelte-tourlight/core';
	import schema from 'svelte-tourlight/schema.json';

	let { children } = $props();
	const doc = {
		schemaVersion: 1 as const,
		id: 't',
		name: 'T',
		steps: [{ id: 'a', title: 'Hi', content: 'Hello', target: '#go' }]
	};
	const steps: SpotlightStep[] = compileTourDocument(doc);
	console.log(validateTourDocument(doc).valid, isRouteActive('/a/*', '/a/b'), schema.title);
</script>

<SpotlightProvider theme="auto" persist navigate={(p) => goto(p)}>
	<SpotlightTour id="t" {steps} />
	{@render children()}
</SpotlightProvider>
