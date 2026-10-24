# svelte-tourlight

**Product tours for Svelte 5: spotlight, multi-page, accessible, and defined as JSON.**

[![npm](https://img.shields.io/npm/v/svelte-tourlight)](https://www.npmjs.com/package/svelte-tourlight)
[![CI](https://github.com/kryptobaseddev/svelte-tourlight/actions/workflows/ci.yml/badge.svg)](https://github.com/kryptobaseddev/svelte-tourlight/actions/workflows/ci.yml)
[![bundle](https://img.shields.io/bundlephobia/minzip/svelte-tourlight)](https://bundlephobia.com/package/svelte-tourlight)
[![license](https://img.shields.io/npm/l/svelte-tourlight)](./LICENSE)

**[Live demo and docs →](https://kryptobaseddev.github.io/svelte-tourlight/)**

## Install

```sh
npm i svelte-tourlight
# or
pnpm add svelte-tourlight
```

[npmjs.com/package/svelte-tourlight](https://www.npmjs.com/package/svelte-tourlight) · peer: `svelte@^5` · runtime dependency: `@floating-ui/dom`

## Quickstart

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { SpotlightProvider, SpotlightTour } from 'svelte-tourlight';
	let { children } = $props();

	const steps = [
		{ id: 'hi', title: 'Welcome', content: 'A centered step.' },
		{ id: 'search', target: '[data-tour="search"]', title: 'Search', content: 'Find anything.' },
		{
			id: 'new',
			target: '[data-tour="new"]',
			title: 'Create',
			content: 'Click it.',
			advanceOn: { event: 'click' }
		}
	];
</script>

<SpotlightProvider theme="auto" persist navigate={(p) => goto(p)}>
	<SpotlightTour id="onboarding" {steps} />
	{@render children()}
</SpotlightProvider>
```

Start it from any component with `useSpotlight().start('onboarding')`. The [Getting started guide](https://kryptobaseddev.github.io/svelte-tourlight/getting-started) covers base paths, persistence and the footer snippet.

## Features

- **Spotlight cutout** that tracks scroll, resize and re-renders
- **Multi-page tours** that navigate for you (SvelteKit `goto`) and **survive reloads**
- **Interactive steps** that finish when the user clicks the real button (`advanceOn`)
- **Beacons** (pulsing hint dots) and **one-off highlights**
- **Accessible**: dialog semantics, focus trap, inert background, arrow and Escape keys, live announcements, 44px controls
- **Phone sheet** below 640px that docks away from low targets such as fixed tab bars
- **Reduced motion** that follows the OS setting or a prop
- **Themes**: light, dark, auto, or custom tokens, all as CSS variables
- **JSON tours** with a JSON Schema and path-level validation; documents never run code
- **Analytics** through a single `onEvent` stream
- **Headless core** for fully custom UIs

## Theming

Pass `theme="light" | "dark" | "auto"` or `{ base, ...tokens }`, or set the `--tourlight-*` variables on `.tourlight-root` in your own CSS. The overlay is marked with `data-tourlight-theme`, never `data-theme`, so **daisyUI** (and other systems that switch themes on `[data-theme]`) don't redefine `--color-*` inside the tour. To use your daisyUI colours, map them: `.tourlight-root { --tourlight-primary: var(--color-primary); }`.

## Why Svelte, not React

Our app is SvelteKit with Svelte 5. Using [react-tourlight](https://github.com/btahir/react-tourlight) would mean shipping React and ReactDOM (about 45 KB gzipped), running a second framework and hydration system, and bridging routing and themes between them. A native runes port is smaller, fits SvelteKit routing and our design tokens directly, and is ours to extend.

## API overview

| Export                                     | What it does                                                                        | Demo                                                                                        |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SpotlightProvider`                        | Root component: theme, persistence, `navigate`, `basePath`, callbacks               | [Getting started](https://kryptobaseddev.github.io/svelte-tourlight/getting-started)        |
| `SpotlightTour`                            | Registers a tour's steps                                                            | [Basic tour](https://kryptobaseddev.github.io/svelte-tourlight/examples/basic)              |
| `useSpotlight()`                           | Reactive controller: `start(id, { stepIndex })`, `next`, `skip`, `highlight`, state | [Basic tour](https://kryptobaseddev.github.io/svelte-tourlight/examples/basic)              |
| Step `route`                               | Multi-page, route-aware steps                                                       | [Multi-page](https://kryptobaseddev.github.io/svelte-tourlight/examples/multi-page)         |
| Step `advanceOn` / `interactive`           | Real input through the cutout                                                       | [Interactive](https://kryptobaseddev.github.io/svelte-tourlight/examples/interactive)       |
| `SpotlightBeacon`, `SpotlightHighlight`    | Hint dots and one-off callouts                                                      | [Beacons](https://kryptobaseddev.github.io/svelte-tourlight/examples/beacons)               |
| `svelte-tourlight/document`                | `validateTourDocument`, `compileTourDocument`, schema                               | [JSON tours](https://kryptobaseddev.github.io/svelte-tourlight/examples/json)               |
| `theme`                                    | Light, dark, auto, custom tokens                                                    | [Themes](https://kryptobaseddev.github.io/svelte-tourlight/examples/themes)                 |
| `sheetPosition`, `mobileBreakpoint`        | Phone sheet, docked away from low targets                                           | [Phone](https://kryptobaseddev.github.io/svelte-tourlight/examples/mobile)                  |
| Built-in a11y, `labels`                    | Keys, focus, announcements, i18n                                                    | [Accessibility](https://kryptobaseddev.github.io/svelte-tourlight/examples/accessibility)   |
| `reducedMotion`                            | Force or follow the OS setting                                                      | [Reduced motion](https://kryptobaseddev.github.io/svelte-tourlight/examples/reduced-motion) |
| `onEvent` and callbacks                    | Analytics                                                                           | [Analytics](https://kryptobaseddev.github.io/svelte-tourlight/examples/analytics)           |
| `tooltip` snippet, `svelte-tourlight/core` | Custom tooltip or a fully headless UI                                               | [Headless](https://kryptobaseddev.github.io/svelte-tourlight/examples/headless)             |

## Credits

Inspired by and ported from [react-tourlight](https://github.com/btahir/react-tourlight) (MIT, © react-tourlight contributors), created by [Bilal Tahir](https://github.com/btahir). See [NOTICE](./NOTICE).

## License

[MIT](./LICENSE)
