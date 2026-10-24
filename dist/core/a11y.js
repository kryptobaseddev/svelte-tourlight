const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');
/**
 * Keep Tab and Shift+Tab cycling inside `container` (and `additional`, the
 * interactive target, when given). Initial focus goes to an element marked
 * `data-tourlight-primary` (the Next button) rather than the close button.
 */
export function createFocusTrap(container, additional) {
    function focusable() {
        const roots = additional ? [container, additional] : [container];
        return roots
            .flatMap((root) => [
            ...(root.matches(FOCUSABLE) ? [root] : []),
            ...Array.from(root.querySelectorAll(FOCUSABLE))
        ])
            .filter((el) => {
            if (el.closest('[inert], [hidden]') || el.hasAttribute('disabled'))
                return false;
            if (el.getAttribute('aria-hidden') === 'true')
                return false;
            const style = getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
    }
    function handleKeyDown(event) {
        if (event.key !== 'Tab')
            return;
        const items = focusable();
        if (items.length === 0) {
            event.preventDefault();
            return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (items.length === 1) {
            event.preventDefault();
            first.focus();
            return;
        }
        const active = document.activeElement;
        if (additional || !active || !items.includes(active)) {
            const index = active ? items.indexOf(active) : -1;
            const next = (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
            event.preventDefault();
            items[next]?.focus();
            return;
        }
        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        }
        else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }
    return {
        activate() {
            document.addEventListener('keydown', handleKeyDown, true);
            const items = focusable();
            const primary = container.querySelector('[data-tourlight-primary]');
            const initial = primary && items.includes(primary) ? primary : items[0];
            if (initial)
                initial.focus({ preventScroll: true });
            else {
                container.setAttribute('tabindex', '-1');
                container.focus({ preventScroll: true });
            }
        },
        deactivate() {
            document.removeEventListener('keydown', handleKeyDown, true);
        }
    };
}
/** "Step 2 of 5: Navigation". */
export function getStepAriaLabel(currentIndex, totalSteps, title) {
    return `Step ${currentIndex + 1} of ${totalSteps}: ${title}`;
}
function isSkippable(el) {
    return (!(el instanceof HTMLElement) ||
        el.tagName === 'SCRIPT' ||
        el.tagName === 'STYLE' ||
        el.tagName === 'LINK');
}
/**
 * Make everything outside `exclude` inert by marking the siblings of each of
 * its ancestors. When `keepInteractive` is given (interactive steps), its
 * ancestor branch is walked into instead, so the target and its subtree stay
 * reachable while their off-path siblings are inerted.
 *
 * Returns a cleanup that removes only the `inert` flags this call added.
 */
export function setInert(exclude, keepInteractive) {
    const inerted = [];
    const keepPath = new Set();
    for (let node = keepInteractive ?? null; node; node = node.parentElement)
        keepPath.add(node);
    const mark = (el) => {
        if (!el.inert) {
            el.inert = true;
            inerted.push(el);
        }
    };
    function inertOffPath(node) {
        if (node === keepInteractive)
            return;
        for (const child of Array.from(node.children)) {
            if (isSkippable(child))
                continue;
            if (keepPath.has(child))
                inertOffPath(child);
            else
                mark(child);
        }
    }
    for (let current = exclude; current?.parentElement; current = current.parentElement) {
        for (const sibling of Array.from(current.parentElement.children)) {
            if (sibling === current || isSkippable(sibling))
                continue;
            if (keepPath.has(sibling))
                inertOffPath(sibling);
            else
                mark(sibling);
        }
    }
    return () => {
        for (const el of inerted)
            el.inert = false;
    };
}
/** Whether the user asked the OS for reduced motion. False outside a browser. */
export function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia)
        return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
