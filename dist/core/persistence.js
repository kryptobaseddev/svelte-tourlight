/** Bumped when the stored envelope changes incompatibly; other versions read as empty. */
const SCHEMA_VERSION = 1;
/** Storage key used when `persist` is on and no `persistKey` is given. */
export const DEFAULT_PERSIST_KEY = 'svelte-tourlight';
/** An in-memory storage adapter, for tests, previews or per-tab progress. */
export function createMemoryStorage() {
    const map = new Map();
    return {
        getItem: (key) => map.get(key) ?? null,
        setItem: (key, value) => void map.set(key, value),
        removeItem: (key) => void map.delete(key)
    };
}
/**
 * Turn the `persist` option into a storage adapter: `true` means
 * `localStorage`, an object is used as is, anything else disables persistence.
 * Returns `null` when storage is unavailable (SSR, blocked site data).
 */
export function resolveStorage(persist) {
    if (!persist)
        return null;
    if (persist !== true)
        return persist;
    try {
        if (typeof window === 'undefined' || !window.localStorage)
            return null;
        return window.localStorage;
    }
    catch {
        return null;
    }
}
function isValidState(state) {
    if (!state || typeof state !== 'object')
        return false;
    const s = state;
    return (['idle', 'active', 'completed'].includes(s.status) &&
        Number.isInteger(s.currentStepIndex) &&
        s.currentStepIndex >= 0 &&
        Number.isInteger(s.stepCount) &&
        s.stepCount > 0 &&
        Number.isFinite(s.savedAt) &&
        Array.isArray(s.seenSteps) &&
        s.seenSteps.every((index) => Number.isInteger(index) && index >= 0));
}
function readEnvelope(storage, key) {
    const empty = { v: SCHEMA_VERSION, tours: {} };
    try {
        const raw = storage.getItem(key);
        if (!raw)
            return empty;
        const parsed = JSON.parse(raw);
        if (!parsed ||
            parsed.v !== SCHEMA_VERSION ||
            !parsed.tours ||
            typeof parsed.tours !== 'object' ||
            Array.isArray(parsed.tours))
            return empty;
        return {
            v: SCHEMA_VERSION,
            tours: Object.fromEntries(Object.entries(parsed.tours).filter(([, state]) => isValidState(state)))
        };
    }
    catch {
        return empty;
    }
}
/** Read every stored tour state. Never throws. */
export function loadPersistedTours(storage, key) {
    return readEnvelope(storage, key).tours;
}
/** Store one tour's state, keeping the others. Best effort: failures are ignored. */
export function savePersistedTour(storage, key, tourId, state, stepCount, stepIds) {
    try {
        const envelope = readEnvelope(storage, key);
        envelope.tours[tourId] = { ...state, savedAt: Date.now(), stepCount, stepIds };
        storage.setItem(key, JSON.stringify(envelope));
    }
    catch {
        // Storage full or unavailable.
    }
}
/** Remove one tour's stored state. Best effort. */
export function clearPersistedTour(storage, key, tourId) {
    try {
        const envelope = readEnvelope(storage, key);
        if (tourId in envelope.tours) {
            delete envelope.tours[tourId];
            storage.setItem(key, JSON.stringify(envelope));
        }
    }
    catch {
        // Best effort.
    }
}
/**
 * Whether a stored snapshot is safe to restore: same step count (and ids when
 * both sides have them), index in range, and not older than `maxAge`.
 */
export function isPersistedStateFresh(state, stepCount, maxAge, stepIds) {
    if (!state || !Number.isInteger(state.currentStepIndex) || !Number.isFinite(state.savedAt))
        return false;
    if (stepIds &&
        state.stepIds &&
        (state.stepIds.length !== stepIds.length || stepIds.some((id, i) => state.stepIds?.[i] !== id)))
        return false;
    if (state.stepCount !== stepCount)
        return false;
    if (state.currentStepIndex < 0 || state.currentStepIndex >= stepCount)
        return false;
    if (maxAge !== undefined && Date.now() - state.savedAt > maxAge)
        return false;
    return true;
}
/** Strip persistence metadata. */
export function toTourState(persisted) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedAt, stepCount, stepIds, ...state } = persisted;
    return state;
}
/** Ordered step ids when every step has one, otherwise `undefined`. */
export function stableStepIds(steps) {
    return steps.every((step) => typeof step.id === 'string')
        ? steps.map((step) => step.id)
        : undefined;
}
