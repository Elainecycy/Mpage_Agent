/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { JSDOM } from 'jsdom';
let dom = null;
const originalGlobals = {};
function applyGlobals(obj) {
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) {
            delete global[key];
        }
        else {
            global[key] = value;
        }
    }
}
/**
 * Initializes and manages a stable JSDOM instance to mock the browser environment in Node.js tests.
 *
 * Lit Element fundamentally requires browser globals (like `window`, `document`, `HTMLElement`,
 * `customElements`, etc.) to be present during module evaluation and class definition. This utility
 * injects these DOM APIs into the global namespace so Lit components can be instantiated and
 * tested as if they were running in a real browser.
 */
export function setupTestDom() {
    if (!dom) {
        dom = new JSDOM('<!DOCTYPE html><body></body>');
        const names = [
            'window',
            'document',
            'HTMLElement',
            'customElements',
            'Element',
            'Node',
            'Event',
            'MutationObserver',
            'requestAnimationFrame',
            'cancelAnimationFrame',
            'CSSStyleSheet',
        ];
        // Save originals once
        for (const name of names) {
            originalGlobals[name] = global[name];
        }
    }
    else {
        // Reset body if already created
        dom.window.document.body.innerHTML = '';
    }
    // TODO(ditman): Update jsdom to ^29.0.0, which includes CSSOM by default, and remove this.
    if (!dom.window.document.adoptedStyleSheets) {
        dom.window.document.adoptedStyleSheets = [];
    }
    if (dom.window.CSSStyleSheet && !dom.window.CSSStyleSheet.prototype.replaceSync) {
        dom.window.CSSStyleSheet.prototype.replaceSync = function (text) {
            let styleEl = this._styleEl;
            if (!styleEl) {
                styleEl = dom.window.document.createElement('style');
                dom.window.document.head.appendChild(styleEl);
                this._styleEl = styleEl;
            }
            styleEl.textContent = text;
        };
    }
    // Set globals
    applyGlobals({
        window: dom.window,
        document: dom.window.document,
        HTMLElement: dom.window.HTMLElement,
        customElements: dom.window.customElements,
        Element: dom.window.Element,
        Node: dom.window.Node,
        Event: dom.window.Event,
        MutationObserver: dom.window.MutationObserver,
        CSSStyleSheet: dom.window.CSSStyleSheet,
        requestAnimationFrame: (cb) => setTimeout(cb, 16),
        cancelAnimationFrame: (id) => clearTimeout(id),
    });
}
/**
 * Cleans up the JSDOM instance and restores the original Node.js globals.
 */
export function teardownTestDom() {
    // Clear the document to prevent leaks between tests
    if (dom) {
        dom.window.document.body.innerHTML = '';
        dom = null;
    }
    applyGlobals(originalGlobals);
}
/**
 * Convenience helper for Lit Elements in tests.
 * Executes a state-mutating function and automatically awaits the component's update cycle.
 */
export async function asyncUpdate(target, updateFn) {
    await updateFn(target);
    if (target.updateComplete) {
        await target.updateComplete;
    }
    else {
        // Await a macro-task for mock objects that lack Lit's lifecycle
        await new Promise(r => setTimeout(r, 0));
    }
}
//# sourceMappingURL=dom-setup.js.map