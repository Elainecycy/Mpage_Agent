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
import { html, nothing, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { TabsApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
let A2uiLitTabs = (() => {
    let _classDecorators = [customElement('a2ui-tabs')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    let _activeIndex_decorators;
    let _activeIndex_initializers = [];
    let _activeIndex_extraInitializers = [];
    var A2uiLitTabs = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _activeIndex_decorators = [state()];
            __esDecorate(this, null, _activeIndex_decorators, { kind: "accessor", name: "activeIndex", static: false, private: false, access: { has: obj => "activeIndex" in obj, get: obj => obj.activeIndex, set: (obj, value) => { obj.activeIndex = value; } }, metadata: _metadata }, _activeIndex_initializers, _activeIndex_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiLitTabs = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the tabs can be customized by redefining the following
         * CSS variables:
         *
         * - `--a2ui-tabs-header-background`: Default transparent.
         * - `--a2ui-tabs-header-background-active`: Default `--a2ui-color-secondary`.
         * - `--a2ui-tabs-header-color`: Default `--a2ui-color-on-surface`.
         * - `--a2ui-tabs-header-color-active`: Default `--a2ui-color-on-secondary`.
         * - `--a2ui-tabs-border`: Default `--a2ui-border-width` solid `--a2ui-color-border`.
         * - `--a2ui-tabs-content-padding`: Default `0 var(--a2ui-spacing-m, 0.5rem)`.
         */
        static { this.styles = css `
    :host {
      display: block;
    }
    .a2ui-tabs-headers {
      display: flex;
      gap: var(--a2ui-spacing-xs, 0.25rem);
      border-bottom: var(
        --a2ui-tabs-border,
        var(--a2ui-border-width, 1px) solid var(--a2ui-color-border, #ccc)
      );
      margin-bottom: var(--a2ui-spacing-m, 0.5rem);
    }
    .a2ui-tabs-header {
      padding: var(--a2ui-spacing-m, 0.5rem) var(--a2ui-spacing-l, 1rem);
      background: var(--a2ui-tabs-header-background, transparent);
      color: var(--a2ui-tabs-header-color, var(--a2ui-color-on-surface));
      border: none;
      border-radius: var(--a2ui-border-radius, 0.25rem) var(--a2ui-border-radius, 0.25rem) 0 0;
      cursor: pointer;
      font-family: inherit;
    }
    .a2ui-tabs-header.active {
      background: var(--a2ui-tabs-header-background-active, var(--a2ui-color-secondary, #eee));
      color: var(--a2ui-tabs-header-color-active, var(--a2ui-color-on-secondary, #333));
    }
    .a2ui-tabs-content {
      padding: var(--a2ui-tabs-content-padding, 0 var(--a2ui-spacing-m, 0.5rem));
    }
  `; }
        createController() {
            return new A2uiController(this, TabsApi);
        }
        #activeIndex_accessor_storage = __runInitializers(this, _activeIndex_initializers, 0);
        get activeIndex() { return this.#activeIndex_accessor_storage; }
        set activeIndex(value) { this.#activeIndex_accessor_storage = value; }
        render() {
            const props = this.controller.props;
            if (!props || !props.tabs)
                return nothing;
            return html `
      <div class="a2ui-tabs-headers">
        ${props.tabs.map((tab, i) => html `
            <button
              class=${classMap({
                'a2ui-tabs-header': true,
                active: i === this.activeIndex,
            })}
              @click=${() => (this.activeIndex = i)}
            >
              ${tab.title}
            </button>
          `)}
      </div>
      <div class="a2ui-tabs-content">
        ${props.tabs[this.activeIndex]
                ? html `${this.renderNode(props.tabs[this.activeIndex].child)}`
                : nothing}
      </div>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _activeIndex_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiLitTabs = _classThis;
})();
export { A2uiLitTabs };
export const A2uiTabs = {
    ...TabsApi,
    tagName: 'a2ui-tabs',
};
//# sourceMappingURL=Tabs.js.map