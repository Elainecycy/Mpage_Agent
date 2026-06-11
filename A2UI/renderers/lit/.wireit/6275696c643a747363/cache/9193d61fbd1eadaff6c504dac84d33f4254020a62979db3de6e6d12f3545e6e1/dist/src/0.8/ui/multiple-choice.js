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
import { html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Root } from "./root.js";
import { A2uiMessageProcessor } from "@a2ui/web_core/data/model-processor";
import { structuralStyles } from "./styles.js";
import { extractStringValue } from "./utils/utils.js";
let MultipleChoice = (() => {
    let _classDecorators = [customElement("a2ui-multiplechoice")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Root;
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    let _selections_decorators;
    let _selections_initializers = [];
    let _selections_extraInitializers = [];
    let _variant_decorators;
    let _variant_initializers = [];
    let _variant_extraInitializers = [];
    let _filterable_decorators;
    let _filterable_initializers = [];
    let _filterable_extraInitializers = [];
    let _isOpen_decorators;
    let _isOpen_initializers = [];
    let _isOpen_extraInitializers = [];
    let _filterText_decorators;
    let _filterText_initializers = [];
    let _filterText_extraInitializers = [];
    var MultipleChoice = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _description_decorators = [property()];
            _options_decorators = [property()];
            _selections_decorators = [property()];
            _variant_decorators = [property()];
            _filterable_decorators = [property({ type: Boolean })];
            _isOpen_decorators = [state()];
            _filterText_decorators = [state()];
            __esDecorate(this, null, _description_decorators, { kind: "accessor", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(this, null, _options_decorators, { kind: "accessor", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            __esDecorate(this, null, _selections_decorators, { kind: "accessor", name: "selections", static: false, private: false, access: { has: obj => "selections" in obj, get: obj => obj.selections, set: (obj, value) => { obj.selections = value; } }, metadata: _metadata }, _selections_initializers, _selections_extraInitializers);
            __esDecorate(this, null, _variant_decorators, { kind: "accessor", name: "variant", static: false, private: false, access: { has: obj => "variant" in obj, get: obj => obj.variant, set: (obj, value) => { obj.variant = value; } }, metadata: _metadata }, _variant_initializers, _variant_extraInitializers);
            __esDecorate(this, null, _filterable_decorators, { kind: "accessor", name: "filterable", static: false, private: false, access: { has: obj => "filterable" in obj, get: obj => obj.filterable, set: (obj, value) => { obj.filterable = value; } }, metadata: _metadata }, _filterable_initializers, _filterable_extraInitializers);
            __esDecorate(this, null, _isOpen_decorators, { kind: "accessor", name: "isOpen", static: false, private: false, access: { has: obj => "isOpen" in obj, get: obj => obj.isOpen, set: (obj, value) => { obj.isOpen = value; } }, metadata: _metadata }, _isOpen_initializers, _isOpen_extraInitializers);
            __esDecorate(this, null, _filterText_decorators, { kind: "accessor", name: "filterText", static: false, private: false, access: { has: obj => "filterText" in obj, get: obj => obj.filterText, set: (obj, value) => { obj.filterText = value; } }, metadata: _metadata }, _filterText_initializers, _filterText_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MultipleChoice = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #description_accessor_storage = __runInitializers(this, _description_initializers, null);
        get description() { return this.#description_accessor_storage; }
        set description(value) { this.#description_accessor_storage = value; }
        #options_accessor_storage = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _options_initializers, []));
        get options() { return this.#options_accessor_storage; }
        set options(value) { this.#options_accessor_storage = value; }
        #selections_accessor_storage = (__runInitializers(this, _options_extraInitializers), __runInitializers(this, _selections_initializers, []));
        get selections() { return this.#selections_accessor_storage; }
        set selections(value) { this.#selections_accessor_storage = value; }
        #variant_accessor_storage = (__runInitializers(this, _selections_extraInitializers), __runInitializers(this, _variant_initializers, "checkbox"));
        get variant() { return this.#variant_accessor_storage; }
        set variant(value) { this.#variant_accessor_storage = value; }
        #filterable_accessor_storage = (__runInitializers(this, _variant_extraInitializers), __runInitializers(this, _filterable_initializers, false));
        get filterable() { return this.#filterable_accessor_storage; }
        set filterable(value) { this.#filterable_accessor_storage = value; }
        #isOpen_accessor_storage = (__runInitializers(this, _filterable_extraInitializers), __runInitializers(this, _isOpen_initializers, false));
        get isOpen() { return this.#isOpen_accessor_storage; }
        set isOpen(value) { this.#isOpen_accessor_storage = value; }
        #filterText_accessor_storage = (__runInitializers(this, _isOpen_extraInitializers), __runInitializers(this, _filterText_initializers, ""));
        get filterText() { return this.#filterText_accessor_storage; }
        set filterText(value) { this.#filterText_accessor_storage = value; }
        static { this.styles = [
            structuralStyles,
            css `
      * {
        box-sizing: border-box;
      }

      :host {
        display: block;
        flex: var(--weight);
        min-height: 0;
        position: relative;
        font-family: 'Google Sans', 'Roboto', sans-serif;
      }

      .container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        position: relative;
      }

      /* Header / Trigger */
      .dropdown-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
        box-shadow: var(--md-sys-elevation-level1);
      }

      .dropdown-header:hover {
        background: var(--md-sys-color-surface-container-low);
      }

      .header-text {
        font-size: 1rem;
        color: var(--md-sys-color-on-surface);
        font-weight: 400;
      }

      .chevron {
        color: var(--md-sys-color-primary);
        font-size: 1.2rem;
        transition: transform 0.2s ease;
      }

      .chevron.open {
        transform: rotate(180deg);
      }

      /* Dropdown Wrapper */
      .dropdown-wrapper {
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        box-shadow: var(--md-sys-elevation-level2);
        padding: 0;
        display: none;
        flex-direction: column;
        margin-top: 4px;
        max-height: 300px;
        transition: opacity 0.2s ease-out;
        overflow: hidden; /* contain children */
      }

      .dropdown-wrapper.open {
        display: flex;
        border: 1px solid var(--md-sys-color-outline-variant);
      }

      /* Scrollable Area for Options */
      .options-scroll-container {
        overflow-y: auto;
        flex: 1; /* take remaining height */
        display: flex;
        flex-direction: column;
      }

      /* Filter Input */
      .filter-container {
        padding: 8px;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        background: var(--md-sys-color-surface);
        z-index: 1; /* ensure top of stack */
        flex-shrink: 0; /* don't shrink */
      }

      .filter-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9rem;
        background: var(--md-sys-color-surface-container-low);
        color: var(--md-sys-color-on-surface);
      }

      .filter-input:focus {
        outline: none;
        border-color: var(--md-sys-color-primary);
      }

      /* Option Item (Checkbox style) */
      .option-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        color: var(--md-sys-color-on-surface);
        font-size: 0.95rem;
        transition: background-color 0.1s;
      }

      .option-item:hover {
        background: var(--md-sys-color-surface-container-highest);
      }

      /* Custom Checkbox */
      .checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid var(--md-sys-color-outline);
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .option-item.selected .checkbox {
        background: var(--md-sys-color-primary);
        border-color: var(--md-sys-color-primary);
      }

      .checkbox-icon {
        color: var(--md-sys-color-on-primary);
        font-size: 14px;
        font-weight: bold;
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.2s;
      }

      .option-item.selected .checkbox-icon {
        opacity: 1;
        transform: scale(1);
      }

      /* Chips Layout */
      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 4px 0;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 16px;
        cursor: pointer;
        user-select: none;
        background: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        transition: all 0.2s ease;
        font-size: 0.9rem;
      }

      .chip:hover {
        background: var(--md-sys-color-surface-container-high);
      }

      .chip.selected {
        background: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
        border-color: var(--md-sys-color-secondary-container);
      }

      .chip.selected:hover {
         background: var(--md-sys-color-secondary-container-high);
      }

      .chip-icon {
        display: none;
        width: 18px;
        height: 18px;
      }

      .chip.selected .chip-icon {
        display: block;
        fill: currentColor;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
        ]; }
        #setBoundValue(value) {
            if (!this.selections || !this.processor) {
                return;
            }
            if (!("path" in this.selections)) {
                return;
            }
            if (!this.selections.path) {
                return;
            }
            this.processor.setData(this.component, this.selections.path, value, this.surfaceId ?? A2uiMessageProcessor.DEFAULT_SURFACE_ID);
        }
        getCurrentSelections() {
            if (Array.isArray(this.selections)) {
                return this.selections;
            }
            if (!this.processor || !this.component) {
                return [];
            }
            const selectionValue = this.processor.getData(this.component, this.selections.path, this.surfaceId ?? A2uiMessageProcessor.DEFAULT_SURFACE_ID);
            return Array.isArray(selectionValue) ? selectionValue : [];
        }
        toggleSelection(value) {
            const current = this.getCurrentSelections();
            if (current.includes(value)) {
                this.#setBoundValue(current.filter((v) => v !== value));
            }
            else {
                this.#setBoundValue([...current, value]);
            }
            this.requestUpdate();
        }
        #renderCheckIcon() {
            return html `
      <svg class="chip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
      </svg>
    `;
        }
        #renderFilter() {
            return html `
      <div class="filter-container">
        <input
          type="text"
          class="filter-input"
          placeholder="Filter options..."
          .value=${this.filterText}
          @input=${(e) => {
                const target = e.target;
                this.filterText = target.value;
            }}
          @click=${(e) => e.stopPropagation()}
        />
      </div>
    `;
        }
        render() {
            const currentSelections = this.getCurrentSelections();
            // Filter options
            const filteredOptions = this.options.filter(option => {
                if (!this.filterText)
                    return true;
                const label = extractStringValue(option.label, this.component, this.processor, this.surfaceId);
                return label.toLowerCase().includes(this.filterText.toLowerCase());
            });
            // Chips Layout
            if (this.variant === "chips") {
                return html `
          <div class="container">
            ${this.description ? html `<div class="header-text" style="margin-bottom: 8px;">${this.description}</div>` : nothing}
            ${this.filterable ? this.#renderFilter() : nothing}
            <div class="chips-container">
              ${filteredOptions.map((option) => {
                    const label = extractStringValue(option.label, this.component, this.processor, this.surfaceId);
                    const isSelected = currentSelections.includes(option.value);
                    return html `
                  <div
                    class="chip ${isSelected ? "selected" : ""}"
                    @click=${(e) => {
                        e.stopPropagation();
                        this.toggleSelection(option.value);
                    }}
                  >
                    ${isSelected ? this.#renderCheckIcon() : nothing}
                    <span>${label}</span>
                  </div>
                `;
                })}
            </div>
             ${filteredOptions.length === 0 ? html `<div style="padding: 8px; font-style: italic; color: var(--md-sys-color-outline);">No options found</div>` : nothing}
          </div>
        `;
            }
            // Default Checkbox Dropdown Layout
            const count = currentSelections.length;
            const headerText = count > 0 ? `${count} Selected` : (this.description ?? "Select items");
            return html `
      <div class="container">
        <div
          class="dropdown-header"
          @click=${() => this.isOpen = !this.isOpen}
        >
          <span class="header-text">${headerText}</span>
          <span class="chevron ${this.isOpen ? "open" : ""}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/>
            </svg>
          </span>
        </div>

        <div class="dropdown-wrapper ${this.isOpen ? "open" : ""}">
          ${this.filterable ? this.#renderFilter() : nothing}
          <div class="options-scroll-container">
            ${filteredOptions.map((option) => {
                const label = extractStringValue(option.label, this.component, this.processor, this.surfaceId);
                const isSelected = currentSelections.includes(option.value);
                return html `
                <div
                  class="option-item ${isSelected ? "selected" : ""}"
                  @click=${(e) => {
                    e.stopPropagation();
                    this.toggleSelection(option.value);
                }}
                >
                  <div class="checkbox">
                    <span class="checkbox-icon">✓</span>
                  </div>
                  <span>${label}</span>
                </div>
              `;
            })}
             ${filteredOptions.length === 0 ? html `<div style="padding: 16px; text-align: center; color: var(--md-sys-color-outline);">No options found</div>` : nothing}
          </div>
        </div>
      </div>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _filterText_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return MultipleChoice = _classThis;
})();
export { MultipleChoice };
//# sourceMappingURL=multiple-choice.js.map