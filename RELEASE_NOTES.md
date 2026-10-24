Install: `npm i svelte-tourlight` (or `pnpm add github:kryptobaseddev/svelte-tourlight#v0.1.2`).

### New in 0.1.2

- **`basePath` option**: step routes stay base-free, and the provider strips the base before matching and adds it to `navigate`. Useful for SvelteKit `paths.base` and GitHub Pages. Also exported: `stripBasePath`, `withBasePath`.
- **Live demo and docs**: https://kryptobaseddev.github.io/svelte-tourlight/ has one runnable example per feature, with copyable code and a Getting started guide.
- **Shorter README** with an API overview that links to each demo.
- **npm trusted publishing** (OIDC with provenance) through `publish.yml`.

No breaking changes.
