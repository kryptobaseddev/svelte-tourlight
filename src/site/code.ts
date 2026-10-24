// Copyable snippets shown on the demo pages. Kept in a .ts module so the
// <script> tags inside them never reach the Svelte parser.

export const install = `npm i svelte-tourlight
# or
pnpm add svelte-tourlight`;

export const layout = `<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { SpotlightProvider, SpotlightTour } from 'svelte-tourlight';
  import { onboarding } from '$lib/tours';

  let { children } = $props();
</script>

<SpotlightProvider
  theme="auto"
  persist={sessionStorage}
  basePath={resolve('/').replace(/\\/$/, '')}
  navigate={(path) => goto(path)}
>
  <SpotlightTour id="onboarding" steps={onboarding} />
  {@render children()}
</SpotlightProvider>`;

export const startButton = `<script lang="ts">
  import { useSpotlight } from 'svelte-tourlight';
  const tour = useSpotlight();
</script>

<button onclick={() => tour.start('onboarding')}>Take the tour</button>`;

export const persistence = `<!-- localStorage: progress survives closing the tab -->
<SpotlightProvider persist>

<!-- sessionStorage: survives reloads in this tab only -->
<SpotlightProvider persist={sessionStorage}>

<!-- Your API: seed from load data, write back on change -->
<SpotlightProvider
  initialState={data.tourState}
  onStateChange={(id, state) => saveTourState(id, state)}
>`;

export const footer = `{#snippet footer(p)}
  {#if p.isFirst && !p.isHighlight}
    <label>
      <input type="checkbox" onchange={() => { disableTours(); p.close(); }} />
      Don't show tours again
    </label>
  {/if}
{/snippet}

<SpotlightProvider {footer}>`;

export const basic = `<script lang="ts">
  import { SpotlightTour, useSpotlight, type SpotlightStep } from 'svelte-tourlight';

  const steps: SpotlightStep[] = [
    { id: 'welcome', title: 'Welcome', content: 'No target: a centered step.' },
    { id: 'search', target: '[data-tour="search"]', title: 'Search', content: 'Find anything.' },
    { id: 'new', target: '[data-tour="new"]', title: 'Create', content: 'Start something new.' },
    { id: 'profile', target: '[data-tour="profile"]', title: 'You', content: 'Settings live here.' }
  ];

  const tour = useSpotlight();
</script>

<SpotlightTour id="basic" {steps} />

<button onclick={() => tour.start('basic')}>Start tour</button>
<button onclick={() => tour.start('basic', { stepIndex: 2 })}>Start at step 3</button>`;

export const multiPage = `// Registered in the root layout, so it outlives page changes.
const steps: SpotlightStep[] = [
  { id: 'first', route: '/examples/multi-page', target: '[data-tour="mp-first"]', title: 'Page one', content: '…' },
  { id: 'second', route: '/examples/multi-page/second', target: '[data-tour="mp-second"]', title: 'Page two', content: '…' }
];

// The provider calls navigate(route) when a step lives elsewhere,
// and persist keeps the position across reloads.
<SpotlightProvider persist={sessionStorage} navigate={(path) => goto(path)}>`;

export const interactive = `const steps: SpotlightStep[] = [
  {
    id: 'add',
    target: '[data-tour="add-item"]',
    title: 'Add your first item',
    content: 'Click the real button to continue.',
    advanceOn: { event: 'click' }
  },
  {
    id: 'name',
    target: '[data-tour="name-field"]',
    title: 'Name it',
    content: 'Type a name and press Enter.',
    advanceOn: { event: 'keydown', selector: 'input' }
  },
  {
    id: 'free',
    target: '[data-tour="playground"]',
    title: 'Try anything',
    content: 'interactive: true lets input through without advancing.',
    interactive: true
  }
];`;

export const beacons = `<script lang="ts">
  import { SpotlightBeacon, SpotlightHighlight, useSpotlight } from 'svelte-tourlight';
  let showNew = $state(false);
  const tour = useSpotlight();
</script>

<!-- A pulsing dot that starts a tour -->
<SpotlightBeacon target="#reports" tour="reports-tour" label="Learn about reports" />

<!-- A dot that opens a one-off highlight -->
<SpotlightBeacon
  target="#export"
  label="What does Export do?"
  highlight={{ title: 'Export', content: 'Download your data as CSV.' }}
/>

<!-- Declarative highlight -->
<SpotlightHighlight active={showNew} target="#inbox" title="New: Inbox"
  content="Messages now live here." onDismiss={() => (showNew = false)} />

<!-- Imperative highlight -->
<button onclick={() => tour.highlight({ target: '#inbox', title: 'Inbox', content: '…' })}>
  What's new
</button>`;

export const json = `import { compileTourDocument, validateTourDocument } from 'svelte-tourlight/document';
import doc from './onboarding.tour.json';

const { valid, issues } = validateTourDocument(doc);
// issues: [{ path: '$.steps[1].route', code: 'invalid-route', message: '…', severity: 'error' }]

const steps = compileTourDocument(doc, {
  actions: { openHelp: () => help.open() },
  conditions: { isAdmin: () => user.role === 'admin' }
});`;

export const themes = `<!-- Built in -->
<SpotlightProvider theme="light">
<SpotlightProvider theme="dark">
<SpotlightProvider theme="auto"> <!-- follows prefers-color-scheme -->

<!-- Custom tokens on top of a base -->
<SpotlightProvider theme={{ base: 'dark', primary: '#f59e0b', radius: '4px' }}>

/* The root carries data-tourlight-theme="dark", never data-theme,
   so daisyUI's [data-theme] themes don't leak into the overlay. */

/* Or plain CSS, using your design tokens */
.tourlight-root {
  --tourlight-primary: var(--color-primary);
  --tourlight-bg: var(--color-surface);
  --tourlight-z-overlay: 60;
  --tourlight-z-tooltip: 61;
}`;

export const mobile = `<!-- Default: a sheet below 640px, docked at the bottom,
     or at the top when the target sits in the lower 45% -->
<SpotlightProvider sheetPosition="auto">

<!-- Force a side -->
<SpotlightProvider sheetPosition="top">
<SpotlightProvider sheetPosition="bottom">

<!-- Change the breakpoint, or 0 to always float -->
<SpotlightProvider mobileBreakpoint={768}>
<SpotlightProvider mobileBreakpoint={0}>`;

export const accessibility = `// Built in, nothing to configure:
// - role="dialog" with aria-labelledby / aria-describedby
// - focus moves to "Next" and is trapped in the tooltip
// - the page behind is inert (the target stays usable on interactive steps)
// - ArrowRight / ArrowLeft move, Escape skips, focus returns to the trigger
// - a polite live region announces "Step 2 of 4: Search"

<SpotlightProvider
  escToDismiss={true}
  labels={{ next: 'Weiter', previous: 'Zurück', skip: 'Überspringen', done: 'Fertig',
            stepOf: (n, total) => \`Schritt \${n} von \${total}\` }}
>`;

export const reducedMotion = `<!-- Follows prefers-reduced-motion by default -->
<SpotlightProvider>

<!-- Or force it either way -->
<SpotlightProvider reducedMotion={true}>
<SpotlightProvider reducedMotion={false}>`;

export const analytics = `<SpotlightProvider
  onEvent={(e) => analytics.track('tour_' + e.type, e)}
  onStepChange={(tourId, index, step) => console.log(tourId, index, step.id)}
  onComplete={(tourId) => markDone(tourId)}
  onSkip={(tourId, index) => markSkipped(tourId, index)}
>

// e.type: 'start' | 'step' | 'complete' | 'skip' | 'stop'
//       | 'target-missing' | 'highlight' | 'error'`;

export const customTooltip = `{#snippet card(p: TooltipRenderProps)}
  <p class="eyebrow">{p.currentIndex + 1} / {p.totalSteps}</p>
  <h2 id={p.titleId}>{p.step.title}</h2>
  <p id={p.contentId}>{p.step.content}</p>
  <button onclick={p.previous} disabled={p.isFirst}>Back</button>
  <button data-tourlight-primary onclick={p.next}>{p.isLast ? 'Finish' : 'Next'}</button>
{/snippet}

<SpotlightTour id="custom" {steps} tooltip={card} />`;

export const headless = `import { createTourStateMachine, generateClipPath, measureElement } from 'svelte-tourlight/core';

const machine = createTourStateMachine({ steps });
machine.subscribe((state) => {
  const el = document.querySelector(steps[state.currentStepIndex].target);
  overlay.style.clipPath = generateClipPath(measureElement(el, 6), 0, 10);
});
await machine.start();`;
