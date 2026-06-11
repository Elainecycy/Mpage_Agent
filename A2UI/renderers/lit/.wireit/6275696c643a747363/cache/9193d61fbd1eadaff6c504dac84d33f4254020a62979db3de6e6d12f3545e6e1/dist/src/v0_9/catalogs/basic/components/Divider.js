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
import { classMap } from "lit/directives/class-map.js";
import { DividerApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { A2uiController } from "@a2ui/lit/v0_9";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
let A2uiDividerElement = (() => {
    let _classDecorators = [customElement("a2ui-divider")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    var A2uiDividerElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiDividerElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the divider can be customized by redefining the following
         * CSS variables:
         *
         * - `--a2ui-divider-border`: The styling for the divider border. Defaults to `--a2ui-border-width` solid `--a2ui-color-border`.
         * - `--a2ui-divider-spacing`: The spacing around the divider. Defaults to `--a2ui-spacing-m`.
         */
        static { this.styles = css `
    :host {
      display: block;
      align-self: stretch;
    }
    .a2ui-divider.horizontal {
      height: 0;
      overflow: hidden;
      font-size: 0.1px;
      line-height: 0;
      border: 0;
      border-top: var(
        --a2ui-divider-border,
        var(--a2ui-border-width, 1px) solid var(--a2ui-color-border, #ccc)
      );
      margin: var(--a2ui-divider-spacing, var(--a2ui-spacing-m, 0.5rem)) 0;
      width: 100%;
    }
    .a2ui-divider.vertical {
      width: var(--a2ui-border-width, 1px);
      background-color: var(--a2ui-color-border, #ccc);
      height: 100%;
      margin: 0 var(--a2ui-divider-spacing, var(--a2ui-spacing-m, 0.5rem));
    }
  `; }
        createController() {
            return new A2uiController(this, DividerApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            const classes = {
                "a2ui-divider": true,
                vertical: props.axis === "vertical",
                horizontal: props.axis !== "vertical",
            };
            return props.axis === "vertical"
                ? html `<div class=${classMap(classes)}></div>`
                : html `<hr class=${classMap(classes)} />`;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiDividerElement = _classThis;
})();
export { A2uiDividerElement };
export const A2uiDivider = {
    ...DividerApi,
    tagName: "a2ui-divider",
};
//# sourceMappingURL=Divider.js.map