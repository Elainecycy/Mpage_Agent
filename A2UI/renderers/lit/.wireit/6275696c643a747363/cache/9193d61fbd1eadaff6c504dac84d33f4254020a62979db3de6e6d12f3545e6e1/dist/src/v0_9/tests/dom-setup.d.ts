/**
 * Initializes and manages a stable JSDOM instance to mock the browser environment in Node.js tests.
 *
 * Lit Element fundamentally requires browser globals (like `window`, `document`, `HTMLElement`,
 * `customElements`, etc.) to be present during module evaluation and class definition. This utility
 * injects these DOM APIs into the global namespace so Lit components can be instantiated and
 * tested as if they were running in a real browser.
 */
export declare function setupTestDom(): void;
/**
 * Cleans up the JSDOM instance and restores the original Node.js globals.
 */
export declare function teardownTestDom(): void;
/**
 * Convenience helper for Lit Elements in tests.
 * Executes a state-mutating function and automatically awaits the component's update cycle.
 */
export declare function asyncUpdate<T = any>(target: T, updateFn: (el: T) => void | Promise<void>): Promise<void>;
//# sourceMappingURL=dom-setup.d.ts.map