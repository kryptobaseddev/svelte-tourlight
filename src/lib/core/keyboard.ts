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

/** Widgets that use the arrow keys themselves; tour navigation leaves them alone. */
const OWNS_ARROWS =
	'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="spinbutton"], [role="combobox"], [role="listbox"], [role="menu"], [role="tablist"], [role="tree"], [role="grid"]';

/**
 * Document-level tour keys: ArrowRight next, ArrowLeft back, Escape dismiss.
 * Ignores modified keys, IME composition and keys aimed at widgets that use
 * arrows themselves.
 */
export function createKeyboardHandler(options: KeyboardHandlerOptions): KeyboardHandler {
	const { onNext, onPrevious, onDismiss, escToDismiss = true } = options;

	function handleKeyDown(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.isComposing
		)
			return;
		const target = event.target;
		if (event.key !== 'Escape' && target instanceof Element && target.closest(OWNS_ARROWS)) return;
		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				onNext();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				onPrevious();
				break;
			case 'Escape':
				if (escToDismiss) {
					event.preventDefault();
					onDismiss();
				}
				break;
		}
	}

	return {
		attach: () => document.addEventListener('keydown', handleKeyDown),
		detach: () => document.removeEventListener('keydown', handleKeyDown)
	};
}
