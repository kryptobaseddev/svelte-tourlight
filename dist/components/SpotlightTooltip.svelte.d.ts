import type { Snippet } from 'svelte';
import type { SpotlightLabels, SpotlightStep, TooltipRenderProps } from '../core/types.js';
interface Props {
    step: SpotlightStep;
    /** The spotlighted element; null for a centered step. */
    target: HTMLElement | null;
    currentIndex: number;
    totalSteps: number;
    isHighlight: boolean;
    /** Render as a bottom sheet. */
    sheet: boolean;
    interactive: boolean;
    showProgress: boolean;
    showSkip: boolean;
    labels?: SpotlightLabels;
    next: () => void;
    previous: () => void;
    skip: () => void;
    close: () => void;
    onError: (error: unknown) => void;
    /** Replaces the whole tooltip body. */
    tooltip?: Snippet<[TooltipRenderProps]>;
    /** Extra content under the body, for example a "Don't show tours again" checkbox. */
    footer?: Snippet<[TooltipRenderProps]>;
}
declare const SpotlightTooltip: import("svelte").Component<Props, {}, "">;
type SpotlightTooltip = ReturnType<typeof SpotlightTooltip>;
export default SpotlightTooltip;
