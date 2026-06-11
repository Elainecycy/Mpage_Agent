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
import { html, nothing, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ComponentContext } from "@a2ui/web_core/v0_9";
import { renderA2uiNode } from "./render-a2ui-node.js";
/**
 * A Lit component that renders an A2UI Surface.
 *
 * This component takes a `SurfaceModel` and dynamically renders the root component
 * and its children using the provided catalog. It handles loading states if the
 * root component is not yet available.
 *
 * @element a2ui-surface
 */
let A2uiSurface = (() => {
    let _classDecorators = [customElement("a2ui-surface")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _surface_decorators;
    let _surface_initializers = [];
    let _surface_extraInitializers = [];
    let __hasRoot_decorators;
    let __hasRoot_initializers = [];
    let __hasRoot_extraInitializers = [];
    var A2uiSurface = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#surface_accessor_storage = __runInitializers(this, _surface_initializers, void 0);
            this.#_hasRoot_accessor_storage = (__runInitializers(this, _surface_extraInitializers), __runInitializers(this, __hasRoot_initializers, false));
            /**
             * Subscription cleanup function.
             * @internal
             */
            this.unsubscribe = __runInitializers(this, __hasRoot_extraInitializers);
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _surface_decorators = [property({ type: Object })];
            __hasRoot_decorators = [state()];
            __esDecorate(this, null, _surface_decorators, { kind: "accessor", name: "surface", static: false, private: false, access: { has: obj => "surface" in obj, get: obj => obj.surface, set: (obj, value) => { obj.surface = value; } }, metadata: _metadata }, _surface_initializers, _surface_extraInitializers);
            __esDecorate(this, null, __hasRoot_decorators, { kind: "accessor", name: "_hasRoot", static: false, private: false, access: { has: obj => "_hasRoot" in obj, get: obj => obj._hasRoot, set: (obj, value) => { obj._hasRoot = value; } }, metadata: _metadata }, __hasRoot_initializers, __hasRoot_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiSurface = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #surface_accessor_storage;
        /**
         * The surface model containing the component tree and catalog.
         */
        get surface() { return this.#surface_accessor_storage; }
        set surface(value) { this.#surface_accessor_storage = value; }
        #_hasRoot_accessor_storage;
        /**
         * Internal state indicating whether the root component exists.
         * @internal
         */
        get _hasRoot() { return this.#_hasRoot_accessor_storage; }
        set _hasRoot(value) { this.#_hasRoot_accessor_storage = value; }
        /**
         * Handles lifecycle updates, specifically when the `surface` property changes.
         *
         * It manages subscriptions to the components model to detect when the 'root'
         * component is created.
         *
         * @param changedProperties Map of changed properties.
         */
        willUpdate(changedProperties) {
            if (changedProperties.has("surface")) {
                if (this.unsubscribe) {
                    this.unsubscribe();
                    this.unsubscribe = undefined;
                }
                this._hasRoot = !!this.surface?.componentsModel.get("root");
                if (this.surface && !this._hasRoot) {
                    const sub = this.surface.componentsModel.onCreated.subscribe((comp) => {
                        if (comp.id === "root") {
                            this._hasRoot = true;
                            this.requestUpdate();
                            this.unsubscribe?.();
                            this.unsubscribe = undefined;
                        }
                    });
                    this.unsubscribe = () => sub.unsubscribe();
                }
            }
        }
        /**
         * Cleans up subscriptions.
         */
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = undefined;
            }
        }
        /**
         * Renders the surface.
         *
         * If `surface` is not set, returns `nothing`.
         * If the root component is not yet available, renders a loading state.
         * Otherwise, renders the root component using `renderA2uiNode`.
         */
        render() {
            if (!this.surface)
                return nothing;
            if (!this._hasRoot) {
                return html `<slot name="loading"><div>Loading surface...</div></slot>`;
            }
            try {
                const rootContext = new ComponentContext(this.surface, "root", "/");
                return html `${renderA2uiNode(rootContext, this.surface.catalog)}`;
            }
            catch (e) {
                console.error("Error creating root context:", e);
                return html `<div>Error rendering surface</div>`;
            }
        }
    };
    return A2uiSurface = _classThis;
})();
export { A2uiSurface };
//# sourceMappingURL=a2ui-surface.js.map