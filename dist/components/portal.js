function resolvePortal(target) {
    if (typeof target === 'string')
        return document.querySelector(target) ?? document.body;
    if (typeof target === 'function')
        return target() ?? document.body;
    return target ?? document.body;
}
/**
 * Move the element to `target` (default `document.body`) so the overlay is
 * never clipped by `overflow` or trapped in a stacking context.
 *
 * Keep the element the only node of its `{#if}` block, so Svelte's own
 * removal touches nothing else.
 */
export function portal(target) {
    return (node) => {
        resolvePortal(target).appendChild(node);
        return () => node.remove();
    };
}
