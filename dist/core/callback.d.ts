/** Run user code without letting sync or async failures escape a UI event. */
export declare function runCallback(callback: (() => unknown) | undefined, onError: (error: unknown) => void): void;
