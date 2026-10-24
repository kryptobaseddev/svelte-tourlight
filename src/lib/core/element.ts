import type { ElementRect, SpotlightTarget } from './types.js';

const DEFAULT_TIMEOUT = 5000;

/**
 * Resolve a target to an element. Never throws: an invalid selector or a
 * resolver that throws counts as "not found yet".
 */
export function resolveTarget(target: SpotlightTarget | null | undefined): HTMLElement | null {
	if (!target) return null;
	if (typeof target === 'string') {
		if (typeof document === 'undefined') return null;
		try {
			return document.querySelector<HTMLElement>(target);
		} catch {
			return null;
		}
	}
	if (typeof target === 'function') {
		try {
			return target() ?? null;
		} catch {
			return null;
		}
	}
	return target;
}

/** Connected, laid out, and not hidden by itself or any ancestor (shadow hosts included). */
export function isElementVisible(element: Element): boolean {
	if (!element.isConnected) return false;
	const rect = element.getBoundingClientRect();
	const view = element.ownerDocument.defaultView;
	if (!view || rect.width <= 0 || rect.height <= 0) return false;
	let current: Element | null = element;
	while (current) {
		const style = view.getComputedStyle(current);
		if (
			current.hasAttribute('hidden') ||
			style.display === 'none' ||
			style.visibility === 'hidden' ||
			style.visibility === 'collapse' ||
			style.opacity === '0'
		)
			return false;
		const root = current.getRootNode();
		current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
	}
	return true;
}

/** Viewport-relative rect of an element, grown by `padding` on every side. */
export function measureElement(element: Element, padding = 0): ElementRect {
	const rect = element.getBoundingClientRect();
	return {
		x: rect.x - padding,
		y: rect.y - padding,
		width: rect.width + padding * 2,
		height: rect.height + padding * 2
	};
}

export interface WaitForElementOptions {
	/** Maximum wait in ms. Default 5000. */
	timeout?: number;
	/** Stops waiting immediately, resolving `null`. */
	signal?: AbortSignal;
	/** Wait until the element is also visible with a non-zero box. */
	requireVisible?: boolean;
}

/**
 * Wait for a target to appear, using a MutationObserver plus a light poll for
 * changes that do not mutate the DOM (CSS transitions, resolver state).
 * Resolves `null` on timeout or abort.
 */
export function waitForElement(
	target: SpotlightTarget,
	options: WaitForElementOptions = {}
): Promise<HTMLElement | null> {
	const { signal, requireVisible = false } = options;
	const timeout = options.timeout ?? DEFAULT_TIMEOUT;
	return new Promise((resolve) => {
		if (signal?.aborted || typeof document === 'undefined' || !document.body) {
			resolve(null);
			return;
		}
		let settled = false;
		// Assigned after the first synchronous check, which may finish early.
		/* eslint-disable prefer-const */
		let observer: MutationObserver | undefined;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let poll: ReturnType<typeof setInterval> | undefined;
		/* eslint-enable prefer-const */
		const finish = (element: HTMLElement | null) => {
			if (settled) return;
			settled = true;
			observer?.disconnect();
			clearTimeout(timer);
			clearInterval(poll);
			signal?.removeEventListener('abort', abort);
			resolve(element);
		};
		const abort = () => finish(null);
		const check = () => {
			const element = resolveTarget(target);
			if (element && (!requireVisible || isElementVisible(element))) finish(element);
		};
		check();
		if (settled) return;
		signal?.addEventListener('abort', abort, { once: true });
		observer = new MutationObserver(check);
		observer.observe(document.body, { childList: true, subtree: true, attributes: true });
		poll = setInterval(check, 50);
		timer = setTimeout(() => finish(null), Math.max(0, timeout));
	});
}

export interface ScrollIntoViewOptions {
	/** Smooth scroll. Ignored (instant) when reduced motion is requested. */
	smooth?: boolean;
	/**
	 * Fraction of the viewport height, from the top, that the target should sit
	 * inside. The bottom-sheet tooltip passes about 0.55 so the target lands
	 * above the sheet. Default 1 (anywhere on screen).
	 */
	visibleFraction?: number;
	/**
	 * The vertical band, as `[start, end]` fractions of the viewport height,
	 * that the target should sit inside. Wins over `visibleFraction`. A
	 * top-docked sheet passes `[0.45, 1]` so the target lands below it.
	 */
	band?: [number, number];
}

/**
 * Scroll an element into view when it is not already inside the visible
 * area, then wait two frames for layout to settle.
 */
export function scrollIntoView(
	element: HTMLElement,
	options: ScrollIntoViewOptions = {}
): Promise<void> {
	const [from, to] = options.band ?? [0, options.visibleFraction ?? 1];
	const rect = element.getBoundingClientRect();
	const start = window.innerHeight * from;
	const end = window.innerHeight * to;
	const inView = rect.top >= start && rect.bottom <= end;
	if (!inView) {
		const behavior: ScrollBehavior = options.smooth ? 'smooth' : 'auto';
		if (from > 0 || to < 1) {
			// Put the target's centre in the middle of the allowed band.
			const delta = rect.top + rect.height / 2 - (start + end) / 2;
			window.scrollBy({ top: delta, behavior });
		} else {
			element.scrollIntoView({ block: 'center', inline: 'nearest', behavior });
		}
	}
	return new Promise((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
	});
}
