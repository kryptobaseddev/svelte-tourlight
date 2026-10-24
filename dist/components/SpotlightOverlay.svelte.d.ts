import type { ElementRect } from '../core/types.js';
interface Props {
    /** The target's padded rect, or null for no cutout. */
    rect: ElementRect | null;
    radius?: number;
    /** Leave a real hole in the pointer surface so input reaches the target. */
    interactive?: boolean;
    loading?: boolean;
    onclick?: () => void;
}
declare const SpotlightOverlay: import("svelte").Component<Props, {}, "">;
type SpotlightOverlay = ReturnType<typeof SpotlightOverlay>;
export default SpotlightOverlay;
