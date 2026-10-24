First release of **svelte-tourlight**: Svelte 5 product tours, ported from [react-tourlight](https://github.com/btahir/react-tourlight) (MIT).

Install from this tag (the package is not on npm yet):

```sh
pnpm add github:kryptobaseddev/svelte-tourlight#v0.1.0
```

The tag includes the built `dist/`, so no build step runs on install.

### Features

- Headless core (`svelte-tourlight/core`): state machine, `waitForElement`, `resolveTarget`, target tracking, evenodd clip-path spotlight, focus trap, `setInert`, keyboard handler, route matcher, persistence.
- Styled player: `SpotlightProvider`, `SpotlightTour`, `SpotlightBeacon`, `SpotlightHighlight` and `useSpotlight()` (a reactive `Tourlight` controller).
- Positioning with `@floating-ui/dom`; a bottom-sheet tooltip below 640px.
- Light, dark, auto and custom themes through CSS variables.
- Keyboard navigation, ARIA dialog, inert background and live announcements.
- Multi-page tours with `route` and `navigate` (SvelteKit `goto`), plus pluggable persistence that survives reloads.
- Interactive steps with real pointer pass-through and `advanceOn`.
- Centered steps with no target.
- JSON tour documents (`svelte-tourlight/document`), with a JSON Schema (`svelte-tourlight/schema.json`) and validation.
- Analytics through `onEvent` plus per-tour callbacks; start at step N; reduced motion.
