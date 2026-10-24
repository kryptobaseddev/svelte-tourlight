import { type Snippet } from 'svelte';
import type { Placement, SpotlightTarget } from '../core/types.js';
interface Props {
    target: SpotlightTarget;
    title: string;
    content?: string | Snippet;
    /** Show the highlight while true. Default true. */
    active?: boolean;
    placement?: Placement;
    spotlightPadding?: number;
    spotlightRadius?: number;
    /** Called when the highlight closes. */
    onDismiss?: () => void;
}
declare const SpotlightHighlight: import("svelte").Component<Props, {}, "">;
type SpotlightHighlight = ReturnType<typeof SpotlightHighlight>;
export default SpotlightHighlight;
