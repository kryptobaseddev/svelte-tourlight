/** Run user code without letting sync or async failures escape a UI event. */
export function runCallback(callback, onError) {
    if (!callback)
        return;
    try {
        const result = callback();
        if (result && typeof result.then === 'function') {
            void Promise.resolve(result).catch(onError);
        }
    }
    catch (error) {
        onError(error);
    }
}
