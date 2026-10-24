import { type Snippet } from 'svelte';
import type { SpotlightStep, TooltipRenderProps } from '../core/types.js';
interface Props {
    /** Unique tour id, passed to `start(id)`. */
    id: string;
    steps: SpotlightStep[];
    onComplete?: () => void;
    onSkip?: (stepIndex: number) => void;
    onStart?: () => void;
    onStepChange?: (stepIndex: number, step: SpotlightStep) => void;
    /** Custom tooltip for this tour only. */
    tooltip?: Snippet<[TooltipRenderProps]>;
}
declare const SpotlightTour: import("svelte").Component<Props, {}, "">;
type SpotlightTour = ReturnType<typeof SpotlightTour>;
export default SpotlightTour;
