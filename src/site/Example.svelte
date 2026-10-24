<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';

	interface Props {
		title: string;
		/** One or two sentences: what this shows. */
		lede: string;
		code?: string;
		codeLabel?: string;
		children: Snippet;
		notes?: Snippet;
	}

	let { title, lede, code, codeLabel, children, notes }: Props = $props();
</script>

<svelte:head><title>{title} · svelte-tourlight</title></svelte:head>

<article class="example">
	<header>
		<h1>{title}</h1>
		<p class="lede">{lede}</p>
	</header>
	<section class="demo" aria-label="Live demo">
		{@render children()}
	</section>
	{#if notes}
		<section class="notes" aria-label="How it works">{@render notes()}</section>
	{/if}
	{#if code}
		<CodeBlock {code} label={codeLabel} />
	{/if}
</article>
