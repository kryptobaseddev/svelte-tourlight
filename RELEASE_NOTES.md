Install: `npm i svelte-tourlight@0.1.3`

### Fixes (found while integrating into the EscapePlan app)

- **The phone sheet no longer covers low targets.** The new `sheetPosition` option is `'auto'` (default), `'top'` or `'bottom'`. In auto mode the sheet docks at the top, with `safe-area-inset-top` padding, whenever the target's centre is in the lower 45% of the viewport (a fixed mobile tab bar, for example). With `'top'`, scrollable targets are moved into the lower part of the screen, below the sheet. The tooltip's `data-sheet` attribute is now `"top"` or `"bottom"`.
- **The theme attribute is scoped.** The overlay and beacons now carry `data-tourlight-theme` instead of `data-theme`, so daisyUI and other `[data-theme]` theme systems no longer redefine `--color-*` inside the tour. If you styled `.tourlight-root[data-theme=…]` yourself, switch to `[data-tourlight-theme=…]`.

### Also

- `scrollIntoView` in `svelte-tourlight/core` accepts `band: [start, end]` (fractions of the viewport height).
- New demos: a `sheetPosition` switch with a fixed tab bar on the [phone page](https://kryptobaseddev.github.io/svelte-tourlight/examples/mobile), and a daisyUI note on the [themes page](https://kryptobaseddev.github.io/svelte-tourlight/examples/themes).
