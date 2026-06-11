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
import { IconApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
import { A2uiController } from "@a2ui/lit/v0_9";
const ICON_NAME_OVERRIDES = {
    "play": "play_arrow",
    "rewind": "fast_rewind",
    "favoriteOff": "favorite_border",
    "starOff": "star_border",
};
function toMaterialSymbol(name) {
    if (ICON_NAME_OVERRIDES[name])
        return ICON_NAME_OVERRIDES[name];
    return name.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
}
let A2uiIconElement = (() => {
    let _classDecorators = [customElement("a2ui-icon")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    var A2uiIconElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiIconElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The icon component can be customized with the following CSS variables:
         *
         * - `--a2ui-icon-size`: Dimensions of the icon.
         * - `--a2ui-icon-color`: Color tint applied to the icon.
         * - `--a2ui-icon-font-family`: Override the font family for icons. Defaults to Material Symbols Outlined.
         * - `--a2ui-icon-font-variation-settings`: Complete override for font-variation-settings.
         */
        static { this.styles = css `
    :where(:host) {
      --_icon-size: var(--a2ui-icon-size, var(--a2ui-font-size-xl, 24px));
    }
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .material-symbol {
      font-family: var(--a2ui-icon-font-family, "Material Symbols Outlined", sans-serif);
      font-size: var(--_icon-size);
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      color: var(--a2ui-icon-color, inherit);
      font-variation-settings: var(--a2ui-icon-font-variation-settings, "FILL" 1);
    }
  `; }
        createController() {
            return new A2uiController(this, IconApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            const iconName = typeof props.name === "string"
                ? toMaterialSymbol(props.name)
                : props.name?.path;
            return html `<span class="material-symbol">${iconName}</span>`;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiIconElement = _classThis;
})();
export { A2uiIconElement };
export const A2uiIcon = {
    ...IconApi,
    tagName: "a2ui-icon",
};
//# sourceMappingURL=Icon.js.map