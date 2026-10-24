/** Run user code without letting sync or async failures escape a UI event. */
export function runCallback(
	callback: (() => unknown) | undefined,
	onError: (error: unknown) => void
): void {
	if (!callback) return;
	try {
		const result = callback();
		if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
			void Promise.resolve(result).catch(onError);
		}
	} catch (error) {
		onError(error);
	}
}
