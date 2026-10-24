<script lang="ts">
	import { tick } from 'svelte';
	import { SpotlightTour, useSpotlight, type SpotlightStep } from '#lib';
	import {
		compileTourDocument,
		formatTourDocument,
		validateTourDocument
	} from '#lib/document/index.js';
	import Example from '../../../site/Example.svelte';
	import { json } from '../../../site/code.js';

	const tour = useSpotlight();

	const starter = {
		$schema:
			'https://raw.githubusercontent.com/kryptobaseddev/svelte-tourlight/main/schema/tour.schema.json',
		schemaVersion: 1,
		id: 'json-demo',
		name: 'JSON demo',
		steps: [
			{
				id: 'intro',
				title: 'From JSON',
				content: 'This tour was compiled from the document in the editor.'
			},
			{
				id: 'editor',
				target: '[data-tour="json-editor"]',
				title: 'Edit me',
				content: 'Change a title, break a field, and watch validation update.'
			},
			{
				id: 'run',
				target: '[data-tour="json-run"]',
				title: 'Run it again',
				content: 'Valid documents compile to steps; invalid ones never run.'
			}
		]
	};

	const broken = JSON.stringify(
		{
			schemaVersion: 2,
			id: '-oops',
			name: '',
			steps: [
				{ id: 'a', title: 'A', content: '', placement: 'middle', route: '//evil.example' },
				{ id: 'a', title: 'B', content: '', interactive: true, extra: 1 }
			]
		},
		null,
		2
	);

	let text = $state(formatTourDocument(starter as Parameters<typeof formatTourDocument>[0]));
	let steps = $state<SpotlightStep[]>([]);

	const parsed = $derived.by(() => {
		try {
			return { value: JSON.parse(text) as unknown, error: null };
		} catch {
			return { value: null, error: 'Invalid JSON: use double-quoted keys and no trailing commas.' };
		}
	});
	const result = $derived(parsed.error ? null : validateTourDocument(parsed.value));
	const valid = $derived(!!result?.valid);

	function run() {
		if (!valid) return;
		steps = compileTourDocument(text);
		// Let SpotlightTour register the new steps before starting.
		void tick().then(() => tour.start('json-demo'));
	}
</script>

<SpotlightTour id="json-demo" {steps} />

<Example
	title="JSON tours"
	lede="Tours can be plain data: reviewable in pull requests, validated in CI, and compiled to steps. Documents never execute code; handler names resolve only against a registry you pass in."
	code={json}
	codeLabel="svelte-tourlight/document"
>
	<div class="json-grid">
		<label class="field grow" data-tour="json-editor">
			<span>Tour document</span>
			<textarea bind:value={text} rows="18" spellcheck="false" aria-describedby="json-status"
			></textarea>
		</label>
		<div class="json-side">
			<div id="json-status" class="status" class:ok={valid} class:bad={!valid} role="status">
				{#if parsed.error}
					{parsed.error}
				{:else if valid}
					Valid: {(parsed.value as { steps: unknown[] }).steps.length} steps
				{:else}
					{result?.issues.filter((i) => i.severity === 'error').length} errors
				{/if}
			</div>
			{#if result && result.issues.length}
				<ul class="issues" aria-label="Validation issues">
					{#each result.issues as issue, i (i)}
						<li class={issue.severity}>
							<code>{issue.path}</code>
							<span>{issue.message}</span>
						</li>
					{/each}
				</ul>
			{/if}
			<div class="actions">
				<button
					type="button"
					class="btn primary"
					data-tour="json-run"
					disabled={!valid}
					onclick={run}>Run this tour</button
				>
				<button type="button" class="btn" onclick={() => (text = broken)}
					>Load a broken document</button
				>
				<button
					type="button"
					class="btn"
					onclick={() =>
						(text = formatTourDocument(starter as Parameters<typeof formatTourDocument>[0]))}
				>
					Reset
				</button>
			</div>
		</div>
	</div>
</Example>
