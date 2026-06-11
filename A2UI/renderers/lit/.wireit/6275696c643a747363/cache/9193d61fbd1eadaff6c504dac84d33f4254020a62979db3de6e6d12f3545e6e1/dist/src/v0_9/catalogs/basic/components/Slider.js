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
import { html, nothing, css } from "lit";
import { customElement } from "lit/decorators.js";
import { SliderApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
import { A2uiController } from "@a2ui/lit/v0_9";
let A2uiSliderElement = (() => {
    let _classDecorators = [customElement("a2ui-slider")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    var A2uiSliderElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiSliderElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The slider can be customized with the following CSS variables:
         *
         * - `--a2ui-slider-track-color`: Color of the slider track. Defaults to `--a2ui-color-secondary`.
         * - `--a2ui-slider-thumb-color`: Color of the slider thumb. Defaults to `--a2ui-color-primary`.
         * - `--a2ui-slider-margin`: Outer margin of the component. Defaults to `--a2ui-spacing-m`.
         * - `--a2ui-slider-label-font-size`: Font size of the label. Defaults to `--a2ui-label-font-size` then `--a2ui-font-size-s`.
         * - `--a2ui-slider-label-font-weight`: Font weight of the label. Defaults to `--a2ui-label-font-weight` then `bold`.
         */
        static { this.styles = css `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--a2ui-spacing-xs, 0.25rem);
      margin: var(--a2ui-slider-margin, var(--a2ui-spacing-m));
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header label {
      font-size: var(--a2ui-slider-label-font-size, var(--a2ui-label-font-size, var(--a2ui-font-size-s)));
      font-weight: var(--a2ui-slider-label-font-weight, var(--a2ui-label-font-weight, bold));
    }
    input[type="range"] {
      width: 100%;
      accent-color: var(--a2ui-slider-thumb-color, var(--a2ui-color-primary, #007bff));
      background: var(--a2ui-slider-track-color, var(--a2ui-color-secondary, #e9ecef));
    }
  `; }
        createController() {
            return new A2uiController(this, SliderApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            return html `
      <div class="header">
        ${props.label ? html `<label>${props.label}</label>` : nothing}
        <span>${props.value}</span>
      </div>
      <input
        type="range"
        min=${props.min ?? 0}
        max=${props.max ?? 100}
        .value=${props.value?.toString() || "0"}
        @input=${(e) => props.setValue?.(Number(e.target.value))}
      />
    `;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiSliderElement = _classThis;
})();
export { A2uiSliderElement };
export const A2uiSlider = {
    ...SliderApi,
    tagName: "a2ui-slider",
};
//# sourceMappingURL=Slider.js.map