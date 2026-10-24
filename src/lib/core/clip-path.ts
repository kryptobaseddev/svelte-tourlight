import type { ElementRect } from './types.js';

/** Large enough that the outer rectangle covers any viewport. */
const VIEWPORT_SIZE = 100000;

/**
 * A CSS `clip-path: path(...)` that covers the viewport except for a rounded
 * rectangle around `rect`.
 *
 * Both subpaths are drawn clockwise, so the `evenodd` fill rule is what makes
 * the inner rectangle a hole (two crossings, even, outside). With the default
 * `nonzero` rule the hole would be filled.
 */
export function generateClipPath(rect: ElementRect, padding = 0, radius = 0): string {
	const x = rect.x - padding;
	const y = rect.y - padding;
	const w = Math.max(0, rect.width + padding * 2);
	const h = Math.max(0, rect.height + padding * 2);
	const r = Math.max(0, Math.min(radius, w / 2, h / 2));
	const path = [
		'M 0 0',
		`H ${VIEWPORT_SIZE}`,
		`V ${VIEWPORT_SIZE}`,
		'H 0',
		'Z',
		`M ${x} ${y + r}`,
		`Q ${x} ${y} ${x + r} ${y}`,
		`H ${x + w - r}`,
		`Q ${x + w} ${y} ${x + w} ${y + r}`,
		`V ${y + h - r}`,
		`Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
		`H ${x + r}`,
		`Q ${x} ${y + h} ${x} ${y + h - r}`,
		'Z'
	].join(' ');
	return `path(evenodd, '${path}')`;
}

/** A clip-path covering the whole viewport with no hole. */
export function generateEmptyClipPath(): string {
	return `path('M 0 0 H ${VIEWPORT_SIZE} V ${VIEWPORT_SIZE} H 0 Z')`;
}

/**
 * The four rectangles around a hole. In interactive steps they catch backdrop
 * clicks while the hole itself is left uncovered, so real events reach the
 * target with no synthetic dispatch.
 */
export function blockerRects(
	rect: ElementRect
): Record<'top' | 'bottom' | 'left' | 'right', Record<string, string>> {
	const px = (n: number) => `${Math.max(0, n)}px`;
	return {
		top: { left: '0', top: '0', right: '0', height: px(rect.y) },
		bottom: { left: '0', right: '0', top: px(rect.y + rect.height), bottom: '0' },
		left: { left: '0', top: px(rect.y), width: px(rect.x), height: px(rect.height) },
		right: { left: px(rect.x + rect.width), right: '0', top: px(rect.y), height: px(rect.height) }
	};
}
