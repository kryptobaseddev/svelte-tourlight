export interface FocusTrap {
    /** Start trapping Tab inside the container and move focus in. */
    activate: () => void;
    /** Stop trapping. The provider restores focus after inert is lifted. */
    deactivate: () => void;
}
/**
 * Keep Tab and Shift+Tab cycling inside `container` (and `additional`, the
 * interactive target, when given). Initial focus goes to an element marked
 * `data-tourlight-primary` (the Next button) rather than the close button.
 */
export declare function createFocusTrap(container: HTMLElement, additional?: HTMLElement | null): FocusTrap;
/** "Step 2 of 5: Navigation". */
export declare function getStepAriaLabel(currentIndex: number, totalSteps: number, title: string): string;
/**
 * Make everything outside `exclude` inert by marking the siblings of each of
 * its ancestors. When `keepInteractive` is given (interactive steps), its
 * ancestor branch is walked into instead, so the target and its subtree stay
 * reachable while their off-path siblings are inerted.
 *
 * Returns a cleanup that removes only the `inert` flags this call added.
 */
export declare function setInert(exclude: HTMLElement, keepInteractive?: HTMLElement | null): () => void;
/** Whether the user asked the OS for reduced motion. False outside a browser. */
export declare function prefersReducedMotion(): boolean;
