<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SpotlightProvider, SpotlightTour, type ThemeProp, type TourEvent } from '#lib';
	import { compileTourDocument } from '#lib/document/index.js';
	import welcome from './tours/welcome.tour.json';
	import { demo } from './demo-state.svelte.js';
	import './demo.css';

	let { children } = $props();

	const steps = compileTourDocument(JSON.stringify(welcome));

	function log(event: TourEvent) {
		demo.events = [
			`${event.type}${'stepIndex' in event ? ` #${event.stepIndex + 1}` : ''}`,
			...demo.events
		].slice(0, 8);
	}

	const theme = $derived<ThemeProp>(
		demo.theme === 'custom'
			? {
					base: 'dark',
					primary: '#f59e0b',
					primaryHover: '#fbbf24',
					primaryColor: '#1c1917',
					progressFill: '#f59e0b',
					beacon: '#f59e0b',
					radius: '4px'
				}
			: demo.theme
	);

	const storage = typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
</script>

<SpotlightProvider {theme} persist={storage} navigate={(path) => goto(path)} onEvent={log}>
	<SpotlightTour id="welcome" {steps} />
	<div class="shell">
		<header class="bar">
			<a class="brand" href="/">svelte-tourlight</a>
			<nav aria-label="Demo pages">
				<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>Home</a>
				<a
					href="/demo/settings"
					aria-current={page.url.pathname === '/demo/settings' ? 'page' : undefined}>Settings</a
				>
				<a href="https://github.com/kryptobaseddev/svelte-tourlight">GitHub</a>
			</nav>
		</header>
		{@render children()}
		<footer class="foot">
			MIT. Inspired by and ported from
			<a href="https://github.com/btahir/react-tourlight">react-tourlight</a> by Bilal Tahir.
		</footer>
	</div>
</SpotlightProvider>
