import type { Attachment } from 'svelte/attachments';
/** Where portalled UI is mounted: an element, a selector, or a function returning one. */
export type PortalTarget = HTMLElement | string | (() => HTMLElement | null | undefined) | null | undefined;
/**
 * Move the element to `target` (default `document.body`) so the overlay is
 * never clipped by `overflow` or trapped in a stacking context.
 *
 * Keep the element the only node of its `{#if}` block, so Svelte's own
 * removal touches nothing else.
 */
export declare function portal(target?: PortalTarget): Attachment<HTMLElement>;
