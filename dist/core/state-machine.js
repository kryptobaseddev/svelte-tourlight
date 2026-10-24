import { runCallback } from './callback.js';
function createInitialState(overrides) {
    return { status: 'idle', currentStepIndex: 0, seenSteps: [], ...overrides };
}
/**
 * A framework-free tour state machine. It evaluates async `when` predicates,
 * runs lifecycle hooks and guards every transition with a generation token so
 * stale async work never overwrites a newer state.
 */
export function createTourStateMachine(options) {
    const { onComplete, onSkip, onStateChange } = options;
    const getSteps = () => options.getSteps?.() ?? options.steps;
    let generation = 0;
    let transitioning = false;
    let entered = false;
    let state = createInitialState(options.initialState);
    const listeners = new Set();
    function setState(partial) {
        state = { ...state, ...partial };
        onStateChange?.(state);
        for (const listener of listeners)
            listener(state);
    }
    async function shouldShowStep(step) {
        if (!step)
            return false;
        if (!step.when)
            return true;
        return await step.when();
    }
    async function enterStep(index, token) {
        const step = getSteps()[index];
        if (!step)
            return;
        await step.onBeforeShow?.();
        if (token !== generation || state.status !== 'active')
            return;
        const seenSteps = state.seenSteps.includes(index)
            ? state.seenSteps
            : [...state.seenSteps, index];
        entered = true;
        setState({ currentStepIndex: index, seenSteps, isTransitioning: false });
        if (!options.deferAfterShow)
            await step.onAfterShow?.();
    }
    function leaveCurrentStep() {
        if (!entered)
            return;
        entered = false;
        runCallback(getSteps()[state.currentStepIndex]?.onHide, (error) => options.onError?.(error));
    }
    /** First index from `from` (inclusive) in `direction` whose `when` passes, or -1. */
    async function findValidStep(from, direction, token) {
        const steps = getSteps();
        for (let index = from; index >= 0 && index < steps.length; index += direction) {
            const show = await shouldShowStep(steps[index]);
            if (token !== generation)
                return -1;
            if (show)
                return index;
        }
        return -1;
    }
    async function transition(work) {
        if (transitioning)
            return;
        transitioning = true;
        const token = ++generation;
        try {
            await work(token);
        }
        catch (error) {
            if (token === generation) {
                entered = false;
                setState({ status: 'idle', isTransitioning: false });
                options.onError?.(error);
            }
        }
        finally {
            if (token === generation)
                transitioning = false;
        }
    }
    function complete() {
        leaveCurrentStep();
        setState({ status: 'completed', isTransitioning: false, completedAt: Date.now() });
        onComplete?.();
    }
    async function start() {
        if (state.status === 'active' || transitioning)
            return;
        await transition(async (token) => {
            setState({
                status: 'active',
                isTransitioning: true,
                completedAt: undefined,
                skippedAt: undefined
            });
            const steps = getSteps();
            const startIndex = Number.isInteger(state.currentStepIndex) &&
                state.currentStepIndex >= 0 &&
                state.currentStepIndex < steps.length
                ? state.currentStepIndex
                : 0;
            const index = await findValidStep(startIndex, 1, token);
            if (token !== generation)
                return;
            if (index === -1)
                complete();
            else
                await enterStep(index, token);
        });
    }
    function dispose() {
        generation++;
        transitioning = false;
    }
    function stop() {
        if (state.status !== 'active')
            return;
        dispose();
        leaveCurrentStep();
        setState({ status: 'idle', isTransitioning: false });
    }
    async function move(direction) {
        if (state.status !== 'active')
            return;
        await transition(async (token) => {
            const index = await findValidStep(state.currentStepIndex + direction, direction, token);
            if (token !== generation)
                return;
            if (index === -1) {
                if (direction === 1)
                    complete();
                return;
            }
            leaveCurrentStep();
            await enterStep(index, token);
        });
    }
    function skip() {
        if (state.status !== 'active')
            return;
        dispose();
        const stepIndex = state.currentStepIndex;
        leaveCurrentStep();
        setState({
            status: 'completed',
            isTransitioning: false,
            skippedAt: { stepIndex, timestamp: Date.now() }
        });
        onSkip?.(stepIndex);
    }
    async function goToStep(index) {
        if (state.status !== 'active' ||
            !Number.isInteger(index) ||
            index < 0 ||
            index >= getSteps().length ||
            index === state.currentStepIndex)
            return;
        await transition(async (token) => {
            const show = await shouldShowStep(getSteps()[index]);
            if (token !== generation || !show)
                return;
            leaveCurrentStep();
            await enterStep(index, token);
        });
    }
    return {
        start,
        stop,
        next: () => move(1),
        previous: () => move(-1),
        skip,
        goToStep,
        getState: () => state,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose
    };
}
