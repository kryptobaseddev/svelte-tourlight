Install: `npm i svelte-tourlight@0.1.5`

### Changes

- **Popovers stay on screen for tall targets.** When the spotlighted element is taller than the viewport, neither the top nor the bottom side fits, and the floating popover used to land below the fold with its buttons out of reach. The popover now also shifts on the cross axis (Floating UI `shift({ crossAxis: true })`), so it slides over the target and stays inside the viewport. A browser test covers 1024x600 and 1280x800.

No API changes.
