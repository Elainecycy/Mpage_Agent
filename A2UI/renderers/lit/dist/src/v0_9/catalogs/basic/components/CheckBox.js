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
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CheckBoxApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
let A2uiCheckBoxElement = (() => {
    let _classDecorators = [customElement('a2ui-checkbox')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    var A2uiCheckBoxElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiCheckBoxElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the checkbox can be customized by redefining the following
         * CSS variables:
         *
         * - `--a2ui-checkbox-size`: Size of the box. Defaults to `1rem`.
         * - `--a2ui-checkbox-border-radius`: Default corner rounding of the box.
         * - `--a2ui-checkbox-gap`: Spacing between the checkbox and its label. Defaults to `8px`.
         * - `--a2ui-checkbox-margin`: Outer margin of the component. Defaults to `--a2ui-spacing-m`.
         * - `--a2ui-checkbox-color-error`: Color for invalid state. Defaults to `red`.
         * - `--a2ui-checkbox-label-font-size`: Font size of the label. Defaults to `--a2ui-label-font-size` then `--a2ui-font-size-s`.
         * - `--a2ui-checkbox-label-font-weight`: Font weight of the label. Defaults to `--a2ui-label-font-weight` then `bold`.
         */
        static { this.styles = css `
    :host {
      display: block;
    }
    .container {
      display: flex;
      flex-direction: column;
      margin: var(--a2ui-checkbox-margin, var(--a2ui-spacing-m));
    }
    label.a2ui-checkbox {
      display: inline-flex;
      align-items: center;
      gap: var(--a2ui-checkbox-gap, var(--a2ui-spacing-s, 0.5rem));
      font-size: var(
        --a2ui-checkbox-label-font-size,
        var(--a2ui-label-font-size, var(--a2ui-font-size-s))
      );
      font-weight: var(--a2ui-checkbox-label-font-weight, var(--a2ui-label-font-weight, bold));
      cursor: pointer;
    }
    label.invalid {
      color: var(--a2ui-checkbox-color-error, red);
    }
    input {
      width: var(--a2ui-checkbox-size, 1rem);
      height: var(--a2ui-checkbox-size, 1rem);
      background: var(--a2ui-checkbox-background, inherit);
      border: var(--a2ui-checkbox-border, var(--a2ui-border));
      border-radius: var(--a2ui-checkbox-border-radius, 4px);
    }
    input.invalid {
      outline: 1px solid var(--a2ui-checkbox-color-error, red);
    }
    .error {
      color: var(--a2ui-checkbox-color-error, red);
      font-size: var(--a2ui-font-size-xs, 0.75rem);
      margin-top: 4px;
    }
  `; }
        createController() {
            return new A2uiController(this, CheckBoxApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            const isInvalid = props.isValid === false;
            const labelClasses = { 'a2ui-checkbox': true, invalid: isInvalid };
            const inputClasses = { invalid: isInvalid };
            return html `
      <div class="container">
        <label class=${classMap(labelClasses)}>
          <input
            type="checkbox"
            class=${classMap(inputClasses)}
            .checked=${props.value || false}
            @change=${(e) => props.setValue?.(e.target.checked)}
          />
          ${props.label}
        </label>
        ${isInvalid && props.validationErrors?.length
                ? html `<div class="error">${props.validationErrors[0]}</div>`
                : nothing}
      </div>
    `;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiCheckBoxElement = _classThis;
})();
export { A2uiCheckBoxElement };
export const A2uiCheckBox = {
    ...CheckBoxApi,
    tagName: 'a2ui-checkbox',
};
//# sourceMappingURL=CheckBox.js.map