# svelte-tourlight

Product tours for **Svelte 5**: a spotlight cutout, steps that follow you across pages and survive reloads, steps you finish by clicking the real button, pulsing hint dots, keyboard and screen-reader support, and tours written as JSON. No React.

svelte-tourlight is a Svelte 5 port of [react-tourlight](https://github.com/btahir/react-tourlight) by Bilal Tahir and contributors, and takes its design from it. The engine and the tour document format were rewritten with runes. See [Credits](#credits).

- **Spotlight cutout.** An `evenodd` `clip-path` dims everything except the target, with a rounded hole that tracks scroll, resize and re-renders.
- **Multi-page tours.** A step can name a `route`. The provider calls your `navigate` (SvelteKit's `goto` works as is) and waits for the target on the new page.
- **Survives reloads.** Persistence is pluggable: `localStorage`, `sessionStorage`, memory, or your own synchronous adapter.
- **Click the real button.** With `interactive` or `advanceOn`, a step lets real pointer and keyboard input through the hole. No events are synthesised.
- **Beacons and highlights.** Pulsing dots start a tour or a one-off "what's new" highlight.
- **Accessible.** The tooltip is a `role="dialog"` with focus trap, `inert` background, arrow and Escape keys, a live region that announces each step, and 44px controls.
- **Phones.** Below 640px the tooltip becomes a bottom sheet with safe-area padding, and the target scrolls into the space above it.
- **Reduced motion.** It follows the OS setting (or a prop): no tweens, no smooth scrolling, no pulse.
- **Themes.** Light, dark, auto, or custom. Every value is a CSS variable.
- **JSON tours.** Documents validate against a JSON Schema, compile to steps, and never execute code.
- **Analytics.** Per-tour callbacks plus one `onEvent` stream.
- **Headless core.** `svelte-tourlight/core` has the state machine and DOM primitives, with no CSS, no components and no Floating UI.

## Install

The package is not on npm yet. Install it from a Git tag:

```sh
pnpm add github:kryptobaseddev/svelte-tourlight#v0.1.0
```

The release tag contains the built `dist/`, so no build step runs on install. Peer dependency: `svelte@^5`. Runtime dependency: `@floating-ui/dom`.

## Quick start

Put the provider in your root layout so it stays mounted across navigations:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { SpotlightProvider, SpotlightTour, type SpotlightStep } from 'svelte-tourlight';

	let { children } = $props();

	const steps: SpotlightStep[] = [
		{ id: 'hello', title: 'Welcome', content: 'A centered step: no target needed.' },
		{
			id: 'search',
			target: '[data-tour="search"]',
			title: 'Search',
			content: 'Find anything here.'
		},
		{
			id: 'new',
			target: '[data-tour="new-project"]',
			title: 'Create a project',
			content: 'Click the button to continue.',
			advanceOn: { event: 'click' }
		},
		{
			id: 'settings',
			route: '/settings',
			target: '#profile',
			title: 'Your profile',
			content: 'Steps can live on other pages.'
		}
	];
</script>

<SpotlightProvider theme="auto" persist navigate={(path) => goto(path)}>
	<SpotlightTour id="onboarding" {steps} />
	{@render children()}
</SpotlightProvider>
```

Start it from anywhere inside the provider:

```svelte
<script lang="ts">
	import { useSpotlight } from 'svelte-tourlight';
	const tour = useSpotlight();
</script>

<button onclick={() => tour.start('onboarding')}>Take the tour</button>
<button onclick={() => tour.start('onboarding', { stepIndex: 2 })}>Resume at step 3</button>

{#if tour.isActive}<p>Step {tour.currentStep + 1} of {tour.totalSteps}</p>{/if}
```

Give targets stable `data-tour` attributes rather than styling classes or `:nth-child` selectors.

## Tours as JSON

```json
{
	"$schema": "https://raw.githubusercontent.com/kryptobaseddev/svelte-tourlight/main/schema/tour.schema.json",
	"schemaVersion": 1,
	"id": "onboarding",
	"name": "Onboarding",
	"steps": [
		{ "id": "hello", "title": "Welcome", "content": "Plain text only." },
		{
			"id": "new",
			"target": "[data-tour=\"new-project\"]",
			"title": "Create",
			"content": "Click it.",
			"advanceOn": { "event": "click" }
		},
		{
			"id": "save",
			"target": "#save",
			"route": "/editor",
			"title": "Save",
			"content": "",
			"action": { "label": "Save now", "handler": "save" },
			"condition": "hasDraft"
		}
	]
}
```

```ts
import { compileTourDocument, validateTourDocument } from 'svelte-tourlight/document';
import doc from './onboarding.tour.json';

const { valid, issues } = validateTourDocument(doc); // issues have JSON paths, e.g. $.steps[2].route
const steps = compileTourDocument(doc, {
	actions: { save: () => editor.save() },
	conditions: { hasDraft: () => editor.dirty }
});
```

Documents are data only. `action`, `condition`, `beforeShow`, `beforeStep`, `afterShow` and `onHide` are names that resolve only against the registry you pass in; an unregistered name throws. `svelte-tourlight/document` has no DOM or Svelte dependency, so you can validate tours in CI or on the server. The schema ships as `svelte-tourlight/schema.json`. The format matches react-tourlight's version 1 documents, except that `target` is optional here (a missing target gives a centered step).

Also exported: `parseTourDocument` (JSON text or object, throws `TourDocumentError`), `formatTourDocument` (canonical key order), `createTourDocument` and `inspectTourDocument`.

## Beacons and highlights

```svelte
<script lang="ts">
	import { SpotlightBeacon, SpotlightHighlight, useSpotlight } from 'svelte-tourlight';
	let showNew = $state(false);
	const tour = useSpotlight();
</script>

<!-- A pulsing dot that starts a tour; it hides while any tour runs. -->
<SpotlightBeacon target="#export" tour="export-tour" label="Learn about export" />

<!-- Or a one-off highlight on click. -->
<SpotlightBeacon target="#export" highlight={{ title: 'Export', content: 'Download as CSV.' }} />

<!-- Declarative highlight. -->
<SpotlightHighlight
	active={showNew}
	target="#reports"
	title="New: reports"
	content="..."
	onDismiss={() => (showNew = false)}
/>

<!-- Imperative highlight. -->
<button onclick={() => tour.highlight({ target: '#reports', title: 'Reports', content: '...' })}
	>What's new</button
>
```

The beacon's hit area is always at least 44px, whatever the dot size.

## Provider options

| Prop                                     | Default              |                                                                                                            |
| ---------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `theme`                                  | `'light'`            | `'light'`, `'dark'`, `'auto'`, or `{ base, ...tokens }`                                                    |
| `persist`                                | off                  | `true` (localStorage), `sessionStorage`, `createMemoryStorage()` or any `{ getItem, setItem, removeItem }` |
| `persistKey`                             | `'svelte-tourlight'` | storage key                                                                                                |
| `persistMaxAge`                          | none                 | ignore stored progress older than this (ms)                                                                |
| `resume`                                 | `true`               | resume a stored active tour when it registers                                                              |
| `initialState`                           |                      | `Record<tourId, TourState>`, for example restored from your API                                            |
| `navigate`                               |                      | `(path) => void \| Promise`, called for steps whose `route` doesn't match                                  |
| `isRouteActive`                          | built-in             | custom matcher; the built-in one handles exact paths, `:param` and trailing `*`                            |
| `waitForElementTimeout`                  | `5000`               | ms to wait for a target before the step is skipped                                                         |
| `autoScroll`                             | `true`               | scroll targets into view                                                                                   |
| `escToDismiss` / `overlayClickToDismiss` | `true`               |                                                                                                            |
| `showProgress` / `showSkip`              | `true`               |                                                                                                            |
| `labels`                                 |                      | `{ next, previous, skip, done, close, loading, stepOf(n, total) }`                                         |
| `reducedMotion`                          | OS setting           | force reduced motion on or off                                                                             |
| `mobileBreakpoint`                       | `640`                | bottom sheet below this width; `0` disables it                                                             |
| `portalTarget`                           | `document.body`      | where the overlay mounts                                                                                   |
| `tooltip`                                |                      | snippet that replaces the tooltip body for all tours                                                       |
| `footer`                                 |                      | snippet rendered under every step's body (for example a "Don't show tours again" checkbox)                 |
| `controller`                             |                      | bring your own `new Tourlight(options)`                                                                    |

Callbacks: `onStart(tourId)`, `onStepChange(tourId, index, step)`, `onComplete(tourId)`, `onSkip(tourId, index)`, `onStateChange(tourId, state)`, `onError(error, tourId)` and `onEvent(event)`. `onEvent` receives `start`, `step`, `complete`, `skip`, `stop`, `target-missing`, `highlight` and `error`, which is enough for analytics without decoding state. `step` fires once per step, and only after the target was found and measured.

## Steps

| Field                                                        |                                                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `id`                                                         | Stable id. Stored progress is discarded when the ordered ids change.                        |
| `target`                                                     | Selector, element, or `() => element`. Leave it out for a centered step.                    |
| `title`, `content`                                           | `content` is a string or a `Snippet`.                                                       |
| `placement`                                                  | `top`, `bottom`, `left`, `right` or `auto` (bottom, flipping when there is no room).        |
| `route`                                                      | The page this step lives on.                                                                |
| `interactive`                                                | Let real input reach the target.                                                            |
| `advanceOn`                                                  | `{ event, selector? }`: advance when that event fires on the target. Implies `interactive`. |
| `timeout`                                                    | Per-step target wait.                                                                       |
| `when`                                                       | `() => boolean \| Promise<boolean>`: skip the step when it returns false.                   |
| `onBeforeStep`, `onBeforeShow`, `onAfterShow`, `onHide`      | Lifecycle hooks; they may be async.                                                         |
| `action`                                                     | `{ label, onClick }`: an extra button.                                                      |
| `spotlightPadding`, `spotlightRadius`, `disableOverlayClose` |                                                                                             |

When a target never appears (for example because the user lacks permission), the step is skipped and `target-missing` is emitted.

## The controller (`useSpotlight()`)

Reactive fields: `isActive`, `activeTourId`, `currentStep`, `totalSteps`, `step`, `targetElement`, `targetRect`, `resolving`, `highlightStep`, `isSheet`, `reducedMotion` and `tourIds`.

Methods: `start(id, { stepIndex })`, `next()`, `previous()`, `goToStep(i)`, `skip()`, `stop()`, `highlight(step)`, `dismissHighlight()`, `registerTour(id, steps, callbacks)`, `unregisterTour(id)` and `resetProgress(id?)`.

## Custom tooltip

```svelte
{#snippet myTooltip(p: TooltipRenderProps)}
	<h2 id={p.titleId}>{p.step.title}</h2>
	<p id={p.contentId}>{p.step.content}</p>
	<button onclick={p.previous} disabled={p.isFirst}>Back</button>
	<button data-tourlight-primary onclick={p.next}>{p.isLast ? 'Finish' : 'Next'}</button>
{/snippet}
<!-- Per tour, or pass `tooltip` on the provider for all tours. -->
<SpotlightTour id="custom" {steps} tooltip={myTooltip} />
```

The dialog, focus trap, keyboard handling, positioning and bottom sheet still apply. Focus starts on the element marked `data-tourlight-primary`.

## Theming

```svelte
<SpotlightProvider theme={{ base: 'dark', primary: '#f59e0b', radius: '6px' }}>
```

Or in CSS, which works with any design system's tokens:

```css
.tourlight-root {
	--tourlight-primary: var(--color-primary);
	--tourlight-bg: var(--color-surface);
	--tourlight-z-overlay: 60;
	--tourlight-z-tooltip: 61;
}
```

Tokens: `overlay`, `background`, `color`, `titleColor`, `mutedColor`, `border`, `radius`, `shadow`, `padding`, `maxWidth`, `fontFamily`, `titleSize`, `contentSize`, `primary`, `primaryColor`, `primaryHover`, `secondaryBorder`, `secondaryHover`, `progressTrack`, `progressFill`, `beacon`, `focusRing`, `duration`, `zOverlay` and `zTooltip`. Each maps to a `--tourlight-*` variable; see `themeVar()`.

## Headless core

```ts
import {
	createTourStateMachine,
	waitForElement,
	resolveTarget,
	trackTarget,
	generateClipPath,
	createFocusTrap,
	setInert,
	createKeyboardHandler,
	isRouteActive,
	loadPersistedTours
} from 'svelte-tourlight/core';
```

Build your own UI on the same engine. The core has no CSS, no Svelte components and no Floating UI.

## Develop

```sh
pnpm install
pnpm dev            # demo site at /
pnpm test:unit      # vitest: node unit tests + browser component tests
pnpm test:e2e       # playwright: desktop + phone
pnpm build          # demo build + svelte-package into dist/
```

Node 26 (see `.nvmrc`) and pnpm.

## Credits

svelte-tourlight is a port of **[react-tourlight](https://github.com/btahir/react-tourlight)** (MIT, © react-tourlight contributors), created by [Bilal Tahir](https://github.com/btahir), and takes its design from it. The state machine, element waiting and tracking, clip-path cutout, interactive blockers, focus and inert handling, route matcher, persistence envelope, and the tour document format and schema all follow react-tourlight's design, reimplemented for Svelte 5. See [NOTICE](./NOTICE).

## License

MIT. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
