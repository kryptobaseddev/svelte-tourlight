/** Where the dot sits on the target's box. */
export type BeaconPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'left' | 'right' | 'top' | 'bottom';
import type { SpotlightStep, SpotlightTarget } from '../core/types.js';
import { type PortalTarget } from './portal.js';
interface Props {
    /** The element the dot is attached to. */
    target: SpotlightTarget;
    /** Tour to start on click. Wins over `highlight`. */
    tour?: string;
    /** Step to start `tour` at. */
    stepIndex?: number;
    /** One-off highlight to show on click; its target defaults to the beacon's. */
    highlight?: Omit<SpotlightStep, 'target'> & {
        target?: SpotlightTarget;
    };
    /** Runs before the tour or highlight starts. */
    onclick?: () => void;
    /** Render the beacon. Default true. */
    active?: boolean;
    /** Hide while a tour or highlight is showing. Default true. */
    hideWhileActive?: boolean;
    position?: BeaconPosition;
    /** Push the dot outward by this many px. */
    offset?: number;
    /** Dot diameter in px. Default 12. The hit area is always at least 44px. */
    size?: number;
    /** Dot colour; defaults to the theme's beacon colour. */
    color?: string;
    /** Accessible name. Default "Start tour". */
    label?: string;
    class?: string;
    portalTarget?: PortalTarget;
    /** Max wait (ms) for the target. Default 5000. */
    timeout?: number;
}
declare const SpotlightBeacon: import("svelte").Component<Props, {}, "">;
type SpotlightBeacon = ReturnType<typeof SpotlightBeacon>;
export default SpotlightBeacon;
