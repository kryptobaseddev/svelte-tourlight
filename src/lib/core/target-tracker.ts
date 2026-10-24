import type { ElementRect, SpotlightTarget } from './types.js';
import { isElementVisible, measureElement, resolveTarget, waitForElement } from './element.js';

export interface TargetTrackerOptions {
	signal: AbortSignal;
	timeout?: number;
	padding: () => number;
	/** Called with the current element and rect, or `null`s while the target is reacquired. */
	onChange: (element: HTMLElement | null, rect: ElementRect | null) => void;
	/** The target disappeared and did not come back within `timeout`. */
	onTimeout: () => void;
}

/**
 * Follow an active target's identity and geometry every frame. When the
 * element disappears (re-render, virtualised list) it reports `null`, waits
 * for it to return and resumes. All work stops when `signal` aborts.
 */
export function trackTarget(
	target: SpotlightTarget,
	initialElement: HTMLElement,
	options: TargetTrackerOptions
): () => void {
	let current: HTMLElement | null = null;
	let previous: ElementRect | null = null;
	let frame: number | undefined;
	let stopped = false;
	const controller = new AbortController();

	const stop = () => {
		if (stopped) return;
		stopped = true;
		controller.abort();
		if (frame !== undefined) cancelAnimationFrame(frame);
		options.signal.removeEventListener('abort', stop);
	};

	function emit(element: HTMLElement | null) {
		const rect = element ? measureElement(element, options.padding()) : null;
		if (
			element === current &&
			rect?.x === previous?.x &&
			rect?.y === previous?.y &&
			rect?.width === previous?.width &&
			rect?.height === previous?.height
		)
			return;
		current = element;
		previous = rect;
		options.onChange(element, rect);
	}

	function schedule() {
		if (!stopped) frame = requestAnimationFrame(check);
	}

	function check() {
		if (stopped) return;
		const candidate = resolveTarget(target);
		if (candidate && isElementVisible(candidate)) {
			emit(candidate);
			schedule();
			return;
		}
		emit(null);
		void waitForElement(target, {
			requireVisible: true,
			timeout: options.timeout,
			signal: controller.signal
		}).then((element) => {
			if (stopped) return;
			if (!element) {
				stop();
				options.onTimeout();
				return;
			}
			emit(element);
			schedule();
		});
	}

	if (options.signal.aborted) return stop;
	options.signal.addEventListener('abort', stop, { once: true });
	emit(initialElement);
	schedule();
	return stop;
}
