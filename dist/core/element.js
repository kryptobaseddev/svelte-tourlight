const DEFAULT_TIMEOUT = 5000;
/**
 * Resolve a target to an element. Never throws: an invalid selector or a
 * resolver that throws counts as "not found yet".
 */
export function resolveTarget(target) {
    if (!target)
        return null;
    if (typeof target === 'string') {
        if (typeof document === 'undefined')
            return null;
        try {
            return document.querySelector(target);
        }
        catch {
            return null;
        }
    }
    if (typeof target === 'function') {
        try {
            return target() ?? null;
        }
        catch {
            return null;
        }
    }
    return target;
}
/** Connected, laid out, and not hidden by itself or any ancestor (shadow hosts included). */
export function isElementVisible(element) {
    if (!element.isConnected)
        return false;
    const rect = element.getBoundingClientRect();
    const view = element.ownerDocument.defaultView;
    if (!view || rect.width <= 0 || rect.height <= 0)
        return false;
    let current = element;
    while (current) {
        const style = view.getComputedStyle(current);
        if (current.hasAttribute('hidden') ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.visibility === 'collapse' ||
            style.opacity === '0')
            return false;
        const root = current.getRootNode();
        current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }
    return true;
}
/** Viewport-relative rect of an element, grown by `padding` on every side. */
export function measureElement(element, padding = 0) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.x - padding,
        y: rect.y - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
    };
}
/**
 * Wait for a target to appear, using a MutationObserver plus a light poll for
 * changes that do not mutate the DOM (CSS transitions, resolver state).
 * Resolves `null` on timeout or abort.
 */
export function waitForElement(target, options = {}) {
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
        let observer;
        let timer;
        let poll;
        /* eslint-enable prefer-const */
        const finish = (element) => {
            if (settled)
                return;
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
            if (element && (!requireVisible || isElementVisible(element)))
                finish(element);
        };
        check();
        if (settled)
            return;
        signal?.addEventListener('abort', abort, { once: true });
        observer = new MutationObserver(check);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        poll = setInterval(check, 50);
        timer = setTimeout(() => finish(null), Math.max(0, timeout));
    });
}
/**
 * Scroll an element into view when it is not already inside the visible
 * area, then wait two frames for layout to settle.
 */
export function scrollIntoView(element, options = {}) {
    const fraction = options.visibleFraction ?? 1;
    const rect = element.getBoundingClientRect();
    const limit = window.innerHeight * fraction;
    const inView = rect.top >= 0 && rect.bottom <= limit;
    if (!inView) {
        const behavior = options.smooth ? 'smooth' : 'auto';
        if (fraction < 1) {
            // Put the target's centre in the middle of the allowed band.
            const delta = rect.top + rect.height / 2 - limit / 2;
            window.scrollBy({ top: delta, behavior });
        }
        else {
            element.scrollIntoView({ block: 'center', inline: 'nearest', behavior });
        }
    }
    return new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
}
