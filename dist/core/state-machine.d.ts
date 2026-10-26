import type { SpotlightStep, TourState } from './types.js';
type StateListener = (state: TourState) => void;
export interface TourStateMachine {
    start: () => Promise<void>;
    stop: () => void;
    next: () => Promise<void>;
    previous: () => Promise<void>;
    skip: () => void;
    goToStep: (index: number) => Promise<void>;
    getState: () => TourState;
    subscribe: (listener: StateListener) => () => void;
    /** Cancel pending work without emitting a stop (used when the host unmounts). */
    dispose: () => void;
}
export interface TourStateMachineOptions {
    steps: SpotlightStep[];
    initialState?: Partial<TourState>;
    onComplete?: () => void;
    onSkip?: (stepIndex: number) => void;
    onStateChange?: (state: TourState) => void;
    /** Read the latest step definitions without recreating an active machine. */
    getSteps?: () => SpotlightStep[];
    onError?: (error: unknown) => void;
    /** UI hosts fire `onAfterShow` themselves, once the target is visible. */
    deferAfterShow?: boolean;
}
/**
 * A framework-free tour state machine. It evaluates async `when` predicates,
 * runs lifecycle hooks and guards every transition with a generation token so
 * stale async work never overwrites a newer state.
 */
export declare function createTourStateMachine(options: TourStateMachineOptions): TourStateMachine;
export {};
