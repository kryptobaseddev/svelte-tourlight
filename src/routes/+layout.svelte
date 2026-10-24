<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { SpotlightProvider, SpotlightTour, type ThemeProp, type TooltipRenderProps } from '#lib';
	import { examples, guides } from '../site/nav.js';
	import { logEvent, site } from '../site/state.svelte.js';
	import { multiPageSteps } from '../site/tours.js';
	import '../site/site.css';

	let { children } = $props();

	// SvelteKit's base path ('' locally, '/svelte-tourlight' on GitHub Pages).
	const basePath = resolve('/').replace(/\/$/, '');
	const storage = typeof sessionStorage === 'undefined' ? undefined : sessionStorage;

	const theme = $derived<ThemeProp>(
		site.theme === 'custom'
			? {
					base: 'dark',
					primary: '#f59e0b',
					primaryHover: '#fbbf24',
					primaryColor: '#1c1917',
					progressFill: '#f59e0b',
					beacon: '#f59e0b',
					focusRing: '#fbbf24',
					radius: '4px'
				}
			: site.theme
	);

	const bare = $derived(page.url.pathname.endsWith('/frame'));
	const path = $derived(page.url.pathname.slice(basePath.length) || '/');
	let menuOpen = $state(false);

	$effect(() => {
		void path;
		menuOpen = false;
	});
</script>

{#snippet footer(p: TooltipRenderProps)}
	{#if p.step.id === 'mp-welcome'}
		<p class="tour-footnote">
			Tip: reload the page on any step. The tour picks up where you left off.
		</p>
	{/if}
{/snippet}

<SpotlightProvider
	{theme}
	reducedMotion={site.reducedMotion}
	persist={storage}
	{basePath}
	navigate={(p) => goto(p)}
	onEvent={logEvent}
	{footer}
>
	<SpotlightTour id="multi-page" steps={multiPageSteps} />
	{#if bare}
		{@render children()}
	{:else}
		<a class="skip" href="#main">Skip to content</a>
		<header class="bar">
			<a class="brand" href={resolve('/')}>
				<span class="logo" aria-hidden="true"></span>svelte-tourlight
			</a>
			<button
				type="button"
				class="menu-toggle"
				aria-expanded={menuOpen}
				aria-controls="site-nav"
				onclick={() => (menuOpen = !menuOpen)}
			>
				{menuOpen ? 'Close' : 'Menu'}
			</button>
			<a class="gh" href="https://github.com/kryptobaseddev/svelte-tourlight">GitHub</a>
		</header>
		<div class="layout">
			<nav id="site-nav" class="side" class:open={menuOpen} aria-label="Documentation">
				<p class="nav-heading">Guides</p>
				<ul>
					{#each guides as item (item.href)}
						<li>
							<a href={resolve(item.href)} aria-current={path === item.href ? 'page' : undefined}
								>{item.label}</a
							>
						</li>
					{/each}
				</ul>
				<p class="nav-heading">Examples</p>
				<ul>
					{#each examples as item (item.href)}
						<li>
							<a
								href={resolve(item.href)}
								aria-current={path.startsWith(item.href) ? 'page' : undefined}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<main id="main" tabindex="-1">
				{@render children()}
			</main>
		</div>
		<footer class="foot">
			MIT licensed. A Svelte 5 port of
			<a href="https://github.com/btahir/react-tourlight">react-tourlight</a>.
		</footer>
	{/if}
</SpotlightProvider>
