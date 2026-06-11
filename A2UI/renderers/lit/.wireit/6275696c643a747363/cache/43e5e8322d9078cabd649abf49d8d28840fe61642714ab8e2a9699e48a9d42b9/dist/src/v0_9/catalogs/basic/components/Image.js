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
import { styleMap } from 'lit/directives/style-map.js';
import { ImageApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
let A2uiImageElement = (() => {
    let _classDecorators = [customElement('a2ui-image')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    var A2uiImageElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiImageElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the image can be customized by redefining the following
         * CSS variables:
         *
         * - `--a2ui-image-border-radius`: Controls the rounded corners of the image. Defaults to `0`.
         * - `--a2ui-image-icon-size`: Controls the size of the `icon` variant. Defaults to `24px`.
         * - `--a2ui-image-avatar-size`: Controls the size of the `avatar` variant. Defaults to `40px`.
         * - `--a2ui-image-small-feature-size`: Controls the max-width of the `smallFeature` variant. Defaults to `100px`.
         * - `--a2ui-image-large-feature-size`: Controls the max-height of the `largeFeature` variant. Defaults to `400px`.
         * - `--a2ui-image-header-size`: Controls the height of the `header` variant. Defaults to `200px`.
         */
        static { this.styles = css `
    img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: var(--a2ui-image-border-radius, 0);
    }
    :host(.icon),
    img.icon {
      width: var(--a2ui-image-icon-size, 24px);
      height: var(--a2ui-image-icon-size, 24px);
    }
    img.avatar {
      width: var(--a2ui-image-avatar-size, 40px);
      height: var(--a2ui-image-avatar-size, 40px);
      border-radius: 50%;
    }
    :host(.smallFeature),
    img.smallFeature {
      max-width: var(--a2ui-image-small-feature-size, 100px);
    }
    :host(.largeFeature),
    img.largeFeature {
      max-height: var(--a2ui-image-large-feature-size, 400px);
    }
    :host(.header),
    img.header {
      height: var(--a2ui-image-header-size, 200px);
      object-fit: cover;
    }
  `; }
        createController() {
            return new A2uiController(this, ImageApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            const classes = {
                'a2ui-image': true,
                [props.variant || '']: !!props.variant,
            };
            const styles = {
                objectFit: props.fit || 'fill',
            };
            return html `<img
      src=${props.url}
      alt=${props.description || ''}
      class=${classMap(classes)}
      style=${styleMap(styles)}
    />`;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiImageElement = _classThis;
})();
export { A2uiImageElement };
export const A2uiImage = {
    ...ImageApi,
    tagName: 'a2ui-image',
};
//# sourceMappingURL=Image.js.map