<script lang="ts">
	import { resolve } from '$app/paths';
	import CodeBlock from '../../site/CodeBlock.svelte';
	import { footer, install, layout, persistence, startButton } from '../../site/code.js';
</script>

<svelte:head><title>Getting started · svelte-tourlight</title></svelte:head>

<article class="example prose">
	<h1>Getting started</h1>
	<p class="lede">Five steps to a working tour in a SvelteKit app.</p>

	<h2>1. Install</h2>
	<CodeBlock code={install} label="Terminal" />
	<p>
		Peer dependency: <code>svelte@^5</code>. The only runtime dependency is
		<code>@floating-ui/dom</code>. The styles load with the provider, so there is nothing else to
		import.
	</p>

	<h2>2. Put the provider in your root layout</h2>
	<p>
		Mount <code>&lt;SpotlightProvider&gt;</code> once in <code>src/routes/+layout.svelte</code>. It
		stays mounted across navigations, which is what lets a tour move between pages.
	</p>
	<CodeBlock code={layout} label="src/routes/+layout.svelte" />

	<h2>3. Route-aware steps with <code>navigate</code></h2>
	<p>
		A step with a <code>route</code> lives on that page. If the current page doesn't match, the
		provider calls
		<code>navigate(path)</code>; pass SvelteKit's <code>goto</code>. If your app has a base path,
		pass it as
		<code>basePath</code> and keep routes in your tours base-free. Routes match exactly, with
		<code>:param</code>
		segments or a trailing <code>*</code>.
	</p>

	<h2>4. Start a tour</h2>
	<CodeBlock code={startButton} label="Any component" />
	<p>
		Give targets stable <code>data-tour="…"</code> attributes rather than styling classes. A step
		whose target never appears (hidden by permissions, say) is skipped and reported as
		<code>target-missing</code>.
	</p>

	<h2>5. Persistence</h2>
	<p>
		Progress is saved through a small synchronous storage interface, so a tour survives reloads. Use
		<code>localStorage</code>, <code>sessionStorage</code>, memory, or seed it from your API.
	</p>
	<CodeBlock code={persistence} label="Persistence options" />

	<h2>Extra: the footer snippet</h2>
	<p>
		<code>footer</code> renders under every step's body, inside the default tooltip. It's the place for
		a "Don't show tours again" checkbox without replacing the whole tooltip.
	</p>
	<CodeBlock code={footer} label="footer snippet" />

	<p class="next">
		Next: <a href={resolve('/examples/basic')}>the basic tour example</a>.
	</p>
</article>
