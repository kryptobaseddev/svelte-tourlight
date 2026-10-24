export interface KeyboardHandlerOptions {
    onNext: () => void;
    onPrevious: () => void;
    onDismiss: () => void;
    /** Escape dismisses. Default true. */
    escToDismiss?: boolean;
}
export interface KeyboardHandler {
    attach: () => void;
    detach: () => void;
}
/**
 * Document-level tour keys: ArrowRight next, ArrowLeft back, Escape dismiss.
 * Ignores modified keys, IME composition and keys aimed at widgets that use
 * arrows themselves.
 */
export declare function createKeyboardHandler(options: KeyboardHandlerOptions): KeyboardHandler;
