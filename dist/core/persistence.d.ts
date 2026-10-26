import type { SpotlightStorage, TourState } from './types.js';
/** Storage key used when `persist` is on and no `persistKey` is given. */
export declare const DEFAULT_PERSIST_KEY = "svelte-tourlight";
/** A stored tour state plus staleness metadata. */
export interface PersistedTourState extends TourState {
    /** Epoch ms when written. */
    savedAt: number;
    /** Step count of the definition when saved. */
    stepCount: number;
    /** Ordered stable step ids, to catch reorders that keep the count. */
    stepIds?: string[];
}
/** An in-memory storage adapter, for tests, previews or per-tab progress. */
export declare function createMemoryStorage(): SpotlightStorage;
/**
 * Turn the `persist` option into a storage adapter: `true` means
 * `localStorage`, an object is used as is, anything else disables persistence.
 * Returns `null` when storage is unavailable (SSR, blocked site data).
 */
export declare function resolveStorage(persist: boolean | SpotlightStorage | undefined | null): SpotlightStorage | null;
/** Read every stored tour state. Never throws. */
export declare function loadPersistedTours(storage: SpotlightStorage, key: string): Record<string, PersistedTourState>;
/** Store one tour's state, keeping the others. Best effort: failures are ignored. */
export declare function savePersistedTour(storage: SpotlightStorage, key: string, tourId: string, state: TourState, stepCount: number, stepIds?: string[]): void;
/** Remove one tour's stored state. Best effort. */
export declare function clearPersistedTour(storage: SpotlightStorage, key: string, tourId: string): void;
/**
 * Whether a stored snapshot is safe to restore: same step count (and ids when
 * both sides have them), index in range, and not older than `maxAge`.
 */
export declare function isPersistedStateFresh(state: PersistedTourState, stepCount: number, maxAge?: number, stepIds?: string[]): boolean;
/** Strip persistence metadata. */
export declare function toTourState(persisted: PersistedTourState): TourState;
/** Ordered step ids when every step has one, otherwise `undefined`. */
export declare function stableStepIds(steps: {
    id?: string;
}[]): string[] | undefined;
