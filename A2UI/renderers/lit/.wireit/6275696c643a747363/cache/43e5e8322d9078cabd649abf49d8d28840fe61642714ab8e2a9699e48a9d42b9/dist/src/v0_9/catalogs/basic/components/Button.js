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
import { ButtonApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
/**
 * A button component that can be used to trigger an action.
 */
let A2uiBasicButtonElement = (() => {
    let _classDecorators = [customElement('a2ui-basic-button')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    var A2uiBasicButtonElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiBasicButtonElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the button can be customized by redefining the following
         * CSS variables:
         *
         * - Primary variant:
         *   - `--a2ui-color-primary`: The color for the primary variant.
         *   - `--a2ui-color-on-primary`: The color of the text on the primary variant.
         * - Standard/default variant:
         *   - `--a2ui-color-secondary`: The color for the default variant.
         *   - `--a2ui-color-on-secondary`: The color of the text on the default variant.
         * - `--a2ui-button-border`: The styling for the button border. Defaults to `--a2ui-border-width` width and `--a2ui-color-border` color.
         * - `--a2ui-button-border-radius`: The border radius of the button. Defaults to `--a2ui-border-radius`.
         * - `--a2ui-button-padding`: The padding of the button. Defaults to `--a2ui-spacing-m`.
         * - `--a2ui-button-margin`: The outer margin of the button. Defaults to `--a2ui-spacing-m`.
         */
        static { this.styles = css `
    :host {
      display: inline-block;
      margin: var(--a2ui-button-margin, var(--a2ui-spacing-m));
    }
    :where(:host) {
      --_color-primary: var(--a2ui-color-primary, #17e);
      --_button-border-radius: var(--a2ui-button-border-radius, var(--a2ui-spacing-s, 0.25rem));
      --_button-padding: var(
        --a2ui-button-padding,
        var(--a2ui-spacing-m, 0.5rem) var(--a2ui-spacing-l, 1rem)
      );
      --_button-border: var(
        --a2ui-button-border,
        var(--a2ui-border-width, 1px) solid var(--a2ui-color-border, #ccc)
      );
    }
    .a2ui-button {
      --_a2ui-text-margin: 0;
      --_a2ui-text-color: var(--a2ui-color-on-secondary, #333);
      padding: var(--_button-padding);
      background: var(--a2ui-button-background, var(--a2ui-color-surface, #fff));
      box-shadow: var(--a2ui-button-box-shadow, none);
      font-weight: var(--a2ui-button-font-weight, normal);
      color: var(--_a2ui-text-color);
      border: var(--_button-border);
      border-radius: var(--_button-border-radius);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .a2ui-button.a2ui-button-primary {
      --_a2ui-text-color: var(--a2ui-color-on-primary, #fff);
      background-color: var(--_color-primary);
      color: var(--_a2ui-text-color);
    }
    .a2ui-button:hover {
      background-color: var(--a2ui-color-secondary-hover, #ddd);
    }
    .a2ui-button.a2ui-button-primary:hover {
      background-color: var(--a2ui-color-primary-hover, #fbd);
    }
    .a2ui-button.a2ui-button-borderless {
      background: none;
      padding: 0;
      color: var(--_color-primary);
    }
  `; }
        createController() {
            return new A2uiController(this, ButtonApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            const isDisabled = props.isValid === false;
            const classes = {
                'a2ui-button': true,
                ['a2ui-button-' + (props.variant || 'default')]: true,
            };
            return html `
      <button
        class=${classMap(classes)}
        @click=${() => !isDisabled && props.action && props.action()}
        ?disabled=${isDisabled}
      >
        ${props.child ? html `${this.renderNode(props.child)}` : nothing}
      </button>
    `;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiBasicButtonElement = _classThis;
})();
export { A2uiBasicButtonElement };
export const A2uiButton = {
    ...ButtonApi,
    tagName: 'a2ui-basic-button',
};
//# sourceMappingURL=Button.js.map