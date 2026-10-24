import { describe, expect, it, vi } from 'vitest';
import { createTourStateMachine } from './state-machine.js';
import { buildRoutePath, isRouteActive } from './route.js';
import { blockerRects, generateClipPath, generateEmptyClipPath } from './clip-path.js';
import { clearPersistedTour, createMemoryStorage, isPersistedStateFresh, loadPersistedTours, savePersistedTour, stableStepIds, toTourState } from './persistence.js';
const steps = (n) => Array.from({ length: n }, (_, i) => ({ id: `s${i}`, target: `#t${i}`, title: `Step ${i}` }));
describe('createTourStateMachine', () => {
    it('starts at the first step and walks forward and back', async () => {
        const m = createTourStateMachine({ steps: steps(3) });
        await m.start();
        expect(m.getState()).toMatchObject({ status: 'active', currentStepIndex: 0, seenSteps: [0] });
        await m.next();
        await m.next();
        expect(m.getState().currentStepIndex).toBe(2);
        await m.previous();
        expect(m.getState().currentStepIndex).toBe(1);
        expect(m.getState().seenSteps).toEqual([0, 1, 2]);
    });
    it('completes after the last step and calls onComplete', async () => {
        const onComplete = vi.fn();
        const m = createTourStateMachine({ steps: steps(2), onComplete });
        await m.start();
        await m.next();
        await m.next();
        expect(m.getState().status).toBe('completed');
        expect(m.getState().completedAt).toBeTypeOf('number');
        expect(onComplete).toHaveBeenCalledOnce();
    });
    it('does not go back past the first step', async () => {
        const m = createTourStateMachine({ steps: steps(2) });
        await m.start();
        await m.previous();
        expect(m.getState()).toMatchObject({ status: 'active', currentStepIndex: 0 });
    });
    it('skips steps whose when() is false, in both directions', async () => {
        const s = steps(4);
        s[1].when = () => false;
        s[2].when = async () => false;
        const m = createTourStateMachine({ steps: s });
        await m.start();
        await m.next();
        expect(m.getState().currentStepIndex).toBe(3);
        await m.previous();
        expect(m.getState().currentStepIndex).toBe(0);
    });
    it('completes immediately when no step passes when()', async () => {
        const s = steps(2).map((step) => ({ ...step, when: () => false }));
        const onComplete = vi.fn();
        const m = createTourStateMachine({ steps: s, onComplete });
        await m.start();
        expect(m.getState().status).toBe('completed');
        expect(onComplete).toHaveBeenCalled();
    });
    it('skip records the step and calls onSkip', async () => {
        const onSkip = vi.fn();
        const m = createTourStateMachine({ steps: steps(3), onSkip });
        await m.start();
        await m.next();
        m.skip();
        expect(m.getState().status).toBe('completed');
        expect(m.getState().skippedAt?.stepIndex).toBe(1);
        expect(onSkip).toHaveBeenCalledWith(1);
    });
    it('stop returns to idle and runs onHide', async () => {
        const s = steps(2);
        s[0].onHide = vi.fn();
        const m = createTourStateMachine({ steps: s });
        await m.start();
        m.stop();
        expect(m.getState().status).toBe('idle');
        expect(s[0].onHide).toHaveBeenCalled();
    });
    it('starts at a given index (start at step N)', async () => {
        const m = createTourStateMachine({ steps: steps(4), initialState: { currentStepIndex: 2 } });
        await m.start();
        expect(m.getState().currentStepIndex).toBe(2);
    });
    it('falls back to 0 for an out-of-range initial index', async () => {
        const m = createTourStateMachine({ steps: steps(2), initialState: { currentStepIndex: 9 } });
        await m.start();
        expect(m.getState().currentStepIndex).toBe(0);
    });
    it('goToStep jumps and ignores invalid indices', async () => {
        const m = createTourStateMachine({ steps: steps(4) });
        await m.start();
        await m.goToStep(3);
        expect(m.getState().currentStepIndex).toBe(3);
        await m.goToStep(-1);
        await m.goToStep(1.5);
        await m.goToStep(10);
        expect(m.getState().currentStepIndex).toBe(3);
    });
    it('runs onBeforeShow before entering and onAfterShow after', async () => {
        const order = [];
        const s = steps(1);
        s[0].onBeforeShow = () => void order.push('before');
        s[0].onAfterShow = () => void order.push('after');
        const m = createTourStateMachine({
            steps: s,
            onStateChange: (st) => order.push(`state:${st.isTransitioning}`)
        });
        await m.start();
        expect(order).toEqual(['state:true', 'before', 'state:false', 'after']);
    });
    it('defers onAfterShow to the host when asked', async () => {
        const s = steps(1);
        s[0].onAfterShow = vi.fn();
        const m = createTourStateMachine({ steps: s, deferAfterShow: true });
        await m.start();
        expect(s[0].onAfterShow).not.toHaveBeenCalled();
    });
    it('a throwing hook resets to idle and reports through onError', async () => {
        const onError = vi.fn();
        const s = steps(1);
        s[0].onBeforeShow = () => {
            throw new Error('boom');
        };
        const m = createTourStateMachine({ steps: s, onError });
        await m.start();
        expect(m.getState().status).toBe('idle');
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
    it('stale async work does not overwrite a stop', async () => {
        let release = () => { };
        const s = steps(2);
        s[1].when = () => new Promise((r) => (release = r));
        const m = createTourStateMachine({ steps: s });
        await m.start();
        const pending = m.next();
        m.stop();
        release(true);
        await pending;
        expect(m.getState().status).toBe('idle');
    });
    it('notifies subscribers and lets them unsubscribe', async () => {
        const listener = vi.fn();
        const m = createTourStateMachine({ steps: steps(2) });
        const off = m.subscribe(listener);
        await m.start();
        const calls = listener.mock.calls.length;
        expect(calls).toBeGreaterThan(0);
        off();
        await m.next();
        expect(listener.mock.calls.length).toBe(calls);
    });
});
describe('isRouteActive', () => {
    it.each([
        ['/settings', '/settings', true],
        ['/settings', '/settings/', true],
        ['/settings', '/settings/profile', false],
        ['/app/*', '/app', true],
        ['/app/*', '/app/a/b', true],
        ['/app/*', '/apps', false],
        ['/app*', '/apps', true],
        ['/users/:id', '/users/42', true],
        ['/users/:id', '/users/42/edit', false],
        ['/users/:id/edit', '/users/42/edit', true],
        ['/users/:id', '/teams/42', false],
        ['/', '/', true]
    ])('%s vs %s → %s', (route, path, expected) => {
        expect(isRouteActive(route, path)).toBe(expected);
    });
    it('builds concrete paths from patterns', () => {
        expect(buildRoutePath('/users/:id/edit', { id: 'a b' })).toBe('/users/a%20b/edit');
        expect(buildRoutePath('/app/*')).toBe('/app');
        expect(buildRoutePath('/users/:id')).toBeNull();
    });
});
describe('generateClipPath', () => {
    it('draws an evenodd path with an outer rect and a rounded hole', () => {
        const path = generateClipPath({ x: 10, y: 20, width: 100, height: 50 }, 4, 8);
        expect(path.startsWith("path(evenodd, 'M 0 0")).toBe(true);
        // Hole starts at (x - pad, y - pad + r).
        expect(path).toContain('M 6 24');
        // Rounded corners use quadratic curves.
        expect(path.match(/Q /g)).toHaveLength(4);
    });
    it('clamps the radius to half the smallest side', () => {
        const path = generateClipPath({ x: 0, y: 0, width: 10, height: 6 }, 0, 50);
        expect(path).toContain('M 0 3');
    });
    it('has an empty variant with no hole', () => {
        expect(generateEmptyClipPath()).not.toContain('evenodd');
    });
    it('builds four blockers around the hole', () => {
        const b = blockerRects({ x: 10, y: 20, width: 30, height: 40 });
        expect(b.top.height).toBe('20px');
        expect(b.bottom.top).toBe('60px');
        expect(b.left).toMatchObject({ width: '10px', top: '20px', height: '40px' });
        expect(b.right.left).toBe('40px');
    });
});
describe('persistence', () => {
    const state = { status: 'active', currentStepIndex: 1, seenSteps: [0, 1] };
    it('round-trips through storage', () => {
        const storage = createMemoryStorage();
        savePersistedTour(storage, 'k', 'tour', state, 3, ['a', 'b', 'c']);
        const loaded = loadPersistedTours(storage, 'k').tour;
        expect(toTourState(loaded)).toEqual(state);
        expect(loaded.stepCount).toBe(3);
        clearPersistedTour(storage, 'k', 'tour');
        expect(loadPersistedTours(storage, 'k')).toEqual({});
    });
    it('ignores corrupt or foreign data', () => {
        const storage = createMemoryStorage();
        storage.setItem('k', '{not json');
        expect(loadPersistedTours(storage, 'k')).toEqual({});
        storage.setItem('k', JSON.stringify({ v: 99, tours: {} }));
        expect(loadPersistedTours(storage, 'k')).toEqual({});
        storage.setItem('k', JSON.stringify({ v: 1, tours: { bad: { status: 'weird' } } }));
        expect(loadPersistedTours(storage, 'k')).toEqual({});
    });
    it('survives a throwing storage', () => {
        const storage = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            },
            removeItem: () => { }
        };
        expect(() => savePersistedTour(storage, 'k', 't', state, 2)).not.toThrow();
        expect(loadPersistedTours(storage, 'k')).toEqual({});
    });
    it('checks freshness: count, ids, range and age', () => {
        const saved = { ...state, savedAt: Date.now(), stepCount: 3, stepIds: ['a', 'b', 'c'] };
        expect(isPersistedStateFresh(saved, 3, undefined, ['a', 'b', 'c'])).toBe(true);
        expect(isPersistedStateFresh(saved, 4)).toBe(false);
        expect(isPersistedStateFresh(saved, 3, undefined, ['a', 'c', 'b'])).toBe(false);
        expect(isPersistedStateFresh({ ...saved, savedAt: Date.now() - 10_000 }, 3, 1000)).toBe(false);
        expect(isPersistedStateFresh({ ...saved, currentStepIndex: 3 }, 3)).toBe(false);
    });
    it('only returns stable ids when every step has one', () => {
        expect(stableStepIds([{ id: 'a' }, { id: 'b' }])).toEqual(['a', 'b']);
        expect(stableStepIds([{ id: 'a' }, {}])).toBeUndefined();
    });
});
