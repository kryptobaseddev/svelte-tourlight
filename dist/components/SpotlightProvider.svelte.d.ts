import '../styles.css';
import { type Snippet } from 'svelte';
import { Tourlight, type TourlightOptions } from '../controller.svelte.js';
import type { TooltipRenderProps } from '../core/types.js';
import { type PortalTarget } from './portal.js';
interface Props extends TourlightOptions {
    children?: Snippet;
    /** Where the overlay mounts. Default `document.body`. */
    portalTarget?: PortalTarget;
    /** Replace the tooltip body for every tour (a tour's own `tooltip` wins). */
    tooltip?: Snippet<[TooltipRenderProps]>;
    /** Extra content under every step's body. */
    footer?: Snippet<[TooltipRenderProps]>;
    /** Bring your own controller, for example to drive tours from outside the tree. */
    controller?: Tourlight;
}
declare const SpotlightProvider: import("svelte").Component<Props, {}, "">;
type SpotlightProvider = ReturnType<typeof SpotlightProvider>;
export default SpotlightProvider;
