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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ComponentContext } from '@a2ui/web_core/v0_9';
import { renderA2uiNode } from './surface/render-a2ui-node.js';
/**
 * A base class for A2UI Lit elements that manages the A2uiController lifecycle.
 *
 * This element handles the reactive attachment and detachment of the `A2uiController`
 * whenever the component's `context` changes. Subclasses only need to implement
 * `createController` to provide their specific schema-bound controller, and `render`
 * to define the template based on the controller's reactive props.
 *
 * @template Api The specific A2UI component API defining the schema for this element.
 */
let A2uiLitElement = (() => {
    let _classSuper = LitElement;
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    return class A2uiLitElement extends _classSuper {
        constructor() {
            super(...arguments);
            this.#context_accessor_storage = __runInitializers(this, _context_initializers, void 0);
            this.controller = __runInitializers(this, _context_extraInitializers);
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _context_decorators = [property({ type: Object })];
            __esDecorate(this, null, _context_decorators, { kind: "accessor", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #context_accessor_storage;
        get context() { return this.#context_accessor_storage; }
        set context(value) { this.#context_accessor_storage = value; }
        /**
         * Helper method to render a child A2UI node.
         * Abstracts away the need to manually create a ComponentContext.
         *
         * @param childRef The reference to the child component to render. Can be a string ID,
         *                 a reference object containing `{ id, basePath }`, or a full inline component definition.
         * @param customPath An explicit data model path to bind the child to. If provided,
         *                   this completely overrides any path defined in the `childRef` object.
         *                   If omitted, it falls back to the `childRef`'s `basePath`, or the current component's path.
         *
         * @returns A Lit template result containing the rendered child component, or `nothing` if the reference is empty.
         */
        renderNode(childRef, customPath) {
            if (!childRef)
                return nothing;
            let model = childRef;
            const { surface, path: parentPath } = this.context.dataContext;
            // Path is resolved in the following order:
            //   customPath > childRef.basePath > parentPath
            let path = customPath;
            // We check !childRef.type because an inline component definition (e.g. { type: 'Button' })
            // should be passed directly to the ComponentContext. If it doesn't have a .type,
            // we treat it as a child reference object (e.g. { id: 'foo', basePath: '/bar' }).
            if (typeof childRef === 'object' && childRef !== null && childRef.id && !childRef.type) {
                model = childRef.id;
                path = path ?? childRef.basePath;
            }
            // Fallback to the current component's context.
            path = path ?? parentPath;
            return renderA2uiNode(new ComponentContext(surface, model, path), surface.catalog);
        }
        /**
         * Reacts to changes in the component's properties.
         *
         * Specifically, when the `context` property changes or is initialized, this method
         * cleans up any existing controller and invokes `createController()` to bind to
         * the new context.
         */
        willUpdate(changedProperties) {
            super.willUpdate(changedProperties);
            if (changedProperties.has('context') && this.context) {
                if (this.controller) {
                    this.removeController(this.controller);
                    this.controller.dispose();
                }
                this.controller = this.createController();
            }
        }
    };
})();
export { A2uiLitElement };
//# sourceMappingURL=a2ui-lit-element.js.map