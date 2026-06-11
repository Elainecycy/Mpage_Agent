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
import { customElement, query } from 'lit/decorators.js';
import { ModalApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
let A2uiLitModal = (() => {
    let _classDecorators = [customElement('a2ui-modal')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    let _dialog_decorators;
    let _dialog_initializers = [];
    let _dialog_extraInitializers = [];
    var A2uiLitModal = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _dialog_decorators = [query('dialog')];
            __esDecorate(this, null, _dialog_decorators, { kind: "accessor", name: "dialog", static: false, private: false, access: { has: obj => "dialog" in obj, get: obj => obj.dialog, set: (obj, value) => { obj.dialog = value; } }, metadata: _metadata }, _dialog_initializers, _dialog_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiLitModal = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the modal can be customized by redefining the following
         * CSS variables:
         *
         * - `--a2ui-modal-backdrop-bg`: Controls the backdrop color of the dialog.
         * - `--a2ui-modal-padding`: Padding inside the dialog content area. Defaults to `24px`.
         * - `--a2ui-modal-border-radius`: Border radius of the dialog. Defaults to `8px`.
         */
        static { this.styles = css `
    :host {
      display: inline-block;
    }
    dialog {
      border: 1px solid var(--a2ui-color-border, #ccc);
      border-radius: var(--a2ui-modal-border-radius, 8px);
      padding: var(--a2ui-modal-padding, 24px);
      min-width: 300px;
      background: var(--a2ui-color-surface, #fff);
    }
    dialog::backdrop {
      background: var(--a2ui-modal-backdrop-bg, rgba(0, 0, 0, 0.5));
    }
  `; }
        createController() {
            return new A2uiController(this, ModalApi);
        }
        #dialog_accessor_storage = __runInitializers(this, _dialog_initializers, void 0);
        get dialog() { return this.#dialog_accessor_storage; }
        set dialog(value) { this.#dialog_accessor_storage = value; }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            return html `
      <div @click=${() => this.dialog?.showModal()} style="display: contents;">
        ${props.trigger ? html `${this.renderNode(props.trigger)}` : nothing}
      </div>
      <dialog class="a2ui-modal">
        <form method="dialog" style="text-align: right;">
          <button>×</button>
        </form>
        ${props.content ? html `${this.renderNode(props.content)}` : nothing}
      </dialog>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _dialog_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiLitModal = _classThis;
})();
export { A2uiLitModal };
export const A2uiModal = {
    ...ModalApi,
    tagName: 'a2ui-modal',
};
//# sourceMappingURL=Modal.js.map