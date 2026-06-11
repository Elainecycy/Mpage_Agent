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
import { consume } from "@lit/context";
import { TextApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
import { A2uiController, Context } from "@a2ui/lit/v0_9";
import { markdown } from "../../../directives/directives.js";
let A2uiBasicTextElement = (() => {
    let _classDecorators = [customElement("a2ui-basic-text")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BasicCatalogA2uiLitElement;
    let _markdownRenderer_decorators;
    let _markdownRenderer_initializers = [];
    let _markdownRenderer_extraInitializers = [];
    var A2uiBasicTextElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _markdownRenderer_decorators = [consume({ context: Context.markdown, subscribe: true })];
            __esDecorate(this, null, _markdownRenderer_decorators, { kind: "accessor", name: "markdownRenderer", static: false, private: false, access: { has: obj => "markdownRenderer" in obj, get: obj => obj.markdownRenderer, set: (obj, value) => { obj.markdownRenderer = value; } }, metadata: _metadata }, _markdownRenderer_initializers, _markdownRenderer_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            A2uiBasicTextElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        /**
         * The styles of the text component can be customized by redefining the following
         * CSS variables:
         *
         * - `--a2ui-text-color-text`: The color of the text. Defaults to `--a2ui-color-on-background`.
         * - `--a2ui-text-caption-color`: The color for caption text. Defaults to `light-dark(#666, #aaa)`.
         *
         * It also supports `--_a2ui-text-color` override from parent components (like Button).
         */
        static { this.styles = css `
    :host {
      display: inline-block;
      color: var(--_a2ui-text-color, var(--a2ui-text-color-text, var(--a2ui-color-on-background)));
    }
    p, h1, h2, h3, h4, h5, h6, ol, ul, li, blockquote, pre {
      margin: var(--_a2ui-text-margin, 0);
    }
    h1, h2, h3, h4, h5 {
      font-family: var(--a2ui-font-family-title, inherit);
      line-height: var(--a2ui-line-height-headings, 1.2);
    }
    h1 { font-size: var(--a2ui-font-size-2xl); }
    h2 { font-size: var(--a2ui-font-size-xl); }
    h3 { font-size: var(--a2ui-font-size-l); }
    p, h4 { font-size: var(--a2ui-font-size-m); }
    h5 { font-size: var(--a2ui-font-size-s); }
    p, ol, ul, li, blockquote, .a2ui-caption {
      line-height: var(--a2ui-line-height-body, 1.5);
    }
    .a2ui-caption, .a2ui-caption > *, .a2ui-caption ::slotted(*) {
      font-size: var(--a2ui-font-size-xs);
      color: var(--a2ui-text-caption-color, light-dark(#666, #aaa));
    }
    a {
      color: var(--a2ui-text-a-color, inherit);
      font-weight: var(--a2ui-text-a-font-weight, inherit);
    }
  `; }
        #markdownRenderer_accessor_storage = __runInitializers(this, _markdownRenderer_initializers, void 0);
        // Retrieve a MarkdownRenderer provided by the application.
        get markdownRenderer() { return this.#markdownRenderer_accessor_storage; }
        set markdownRenderer(value) { this.#markdownRenderer_accessor_storage = value; }
        createController() {
            return new A2uiController(this, TextApi);
        }
        render() {
            const props = this.controller.props;
            if (!props)
                return nothing;
            // Use props.variant to convert props.text to markdown
            let markdownText = typeof props.text === "string" ? props.text : String(props.text ?? "");
            switch (props.variant) {
                case "h1":
                    markdownText = `# ${markdownText}`;
                    break;
                case "h2":
                    markdownText = `## ${markdownText}`;
                    break;
                case "h3":
                    markdownText = `### ${markdownText}`;
                    break;
                case "h4":
                    markdownText = `#### ${markdownText}`;
                    break;
                case "h5":
                    markdownText = `##### ${markdownText}`;
                    break;
                default:
                    break; // body and caption.
            }
            const renderedMarkdown = markdown(markdownText, this.markdownRenderer);
            // There's not a good way to handle the caption variant in markdown, so we
            // tag it with a class so it can be tweaked via CSS.
            if (props.variant === "caption") {
                return html `<span class="a2ui-caption">${renderedMarkdown}</span>`;
            }
            return html `${renderedMarkdown}`;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _markdownRenderer_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return A2uiBasicTextElement = _classThis;
})();
export { A2uiBasicTextElement };
export const A2uiText = {
    ...TextApi,
    tagName: "a2ui-basic-text",
};
//# sourceMappingURL=Text.js.map