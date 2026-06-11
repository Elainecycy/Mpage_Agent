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
import { LitElement, html, css, nothing, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SnackType } from "../types/types";
import { repeat } from "lit/directives/repeat.js";
import { SnackbarActionEvent } from "../events/events";
import { classMap } from "lit/directives/class-map.js";
import { v0_8 } from "@a2ui/lit";
const DEFAULT_TIMEOUT = 8000;
let Snackbar = (() => {
    let _classDecorators = [customElement("ui-snackbar")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    let _error_decorators;
    let _error_initializers = [];
    let _error_extraInitializers = [];
    let _timeout_decorators;
    let _timeout_initializers = [];
    let _timeout_extraInitializers = [];
    var Snackbar = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _active_decorators = [property({ reflect: true, type: Boolean })];
            _error_decorators = [property({ reflect: true, type: Boolean })];
            _timeout_decorators = [property()];
            __esDecorate(this, null, _active_decorators, { kind: "accessor", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            __esDecorate(this, null, _error_decorators, { kind: "accessor", name: "error", static: false, private: false, access: { has: obj => "error" in obj, get: obj => obj.error, set: (obj, value) => { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            __esDecorate(this, null, _timeout_decorators, { kind: "accessor", name: "timeout", static: false, private: false, access: { has: obj => "timeout" in obj, get: obj => obj.timeout, set: (obj, value) => { obj.timeout = value; } }, metadata: _metadata }, _timeout_initializers, _timeout_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Snackbar = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #active_accessor_storage = __runInitializers(this, _active_initializers, false);
        get active() { return this.#active_accessor_storage; }
        set active(value) { this.#active_accessor_storage = value; }
        #error_accessor_storage = (__runInitializers(this, _active_extraInitializers), __runInitializers(this, _error_initializers, false));
        get error() { return this.#error_accessor_storage; }
        set error(value) { this.#error_accessor_storage = value; }
        #timeout_accessor_storage = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _timeout_initializers, DEFAULT_TIMEOUT));
        get timeout() { return this.#timeout_accessor_storage; }
        set timeout(value) { this.#timeout_accessor_storage = value; }
        #messages = (__runInitializers(this, _timeout_extraInitializers), []);
        #timeout = 0;
        static { this.styles = [
            unsafeCSS(v0_8.Styles.structuralStyles),
            css `
      :host {
        --text-color: var(--n-0);
        --bb-body-medium: 16px;
        --bb-body-line-height-medium: 24px;

        display: flex;
        align-items: center;
        position: fixed;
        bottom: var(--bb-grid-size-7);
        left: 50%;
        translate: -50% 0;
        opacity: 0;
        pointer-events: none;
        border-radius: var(--bb-grid-size-2);
        background: var(--n-90);
        padding: var(--bb-grid-size-3) var(--bb-grid-size-6);
        width: 60svw;
        max-width: 720px;
        z-index: 1800;
        scrollbar-width: none;
        overflow-x: scroll;
        font: 400 var(--bb-body-medium) / var(--bb-body-line-height-medium)
          var(--bb-font-family);
      }

      :host([active]) {
        transition: opacity 0.3s cubic-bezier(0, 0, 0.3, 1) 0.2s;
        opacity: 1;
        pointer-events: auto;
      }

      :host([error]) {
        background: var(--e-90);
        --text-color: var(--e-40);
      }

      .g-icon {
        flex: 0 0 auto;
        color: var(--text-color);
        margin-right: var(--bb-grid-size-4);

        &.rotate {
          animation: 1s linear 0s infinite normal forwards running rotate;
        }
      }

      #messages {
        color: var(--text-color);
        flex: 1 1 auto;
        margin-right: var(--bb-grid-size-11);

        a,
        a:visited {
          color: var(--bb-ui-600);
          text-decoration: none;

          &:hover {
            color: var(--bb-ui-500);
            text-decoration: underline;
          }
        }
      }

      #actions {
        flex: 0 1 auto;
        width: fit-content;
        margin-right: var(--bb-grid-size-3);

        & button {
          font: 500 var(--bb-body-medium) / var(--bb-body-line-height-medium)
            var(--bb-font-family);
          padding: 0;
          background: transparent;
          border: none;
          margin: 0 var(--bb-grid-size-4);
          color: var(--text-color);
          opacity: 0.7;
          transition: opacity 0.2s cubic-bezier(0, 0, 0.3, 1);

          &:not([disabled]) {
            cursor: pointer;

            &:hover,
            &:focus {
              opacity: 1;
            }
          }
        }
      }

      #close {
        display: flex;
        align-items: center;
        padding: 0;
        color: var(--text-color);
        background: transparent;
        border: none;
        margin: 0 0 0 var(--bb-grid-size-2);
        opacity: 0.7;
        transition: opacity 0.2s cubic-bezier(0, 0, 0.3, 1);

        .g-icon {
          margin-right: 0;
        }

        &:not([disabled]) {
          cursor: pointer;

          &:hover,
          &:focus {
            opacity: 1;
          }
        }
      }

      @keyframes rotate {
        from {
          rotate: 0deg;
        }

        to {
          rotate: 360deg;
        }
      }
    `,
        ]; }
        show(message, replaceAll = false) {
            const existingMessage = this.#messages.findIndex((msg) => msg.id === message.id);
            if (existingMessage === -1) {
                if (replaceAll) {
                    this.#messages.length = 0;
                }
                this.#messages.push(message);
            }
            else {
                this.#messages[existingMessage] = message;
            }
            window.clearTimeout(this.#timeout);
            if (!this.#messages.every((msg) => msg.persistent)) {
                this.#timeout = window.setTimeout(() => {
                    this.hide();
                }, this.timeout);
            }
            this.error = this.#messages.some((msg) => msg.type === SnackType.ERROR);
            this.active = true;
            this.requestUpdate();
            return message.id;
        }
        hide(id) {
            if (id) {
                const idx = this.#messages.findIndex((msg) => msg.id === id);
                if (idx !== -1) {
                    this.#messages.splice(idx, 1);
                }
            }
            else {
                this.#messages.length = 0;
            }
            this.active = this.#messages.length !== 0;
            this.updateComplete.then((avoidedUpdate) => {
                if (!avoidedUpdate) {
                    return;
                }
                this.requestUpdate();
            });
        }
        render() {
            let rotate = false;
            let icon = "";
            for (let i = this.#messages.length - 1; i >= 0; i--) {
                if (!this.#messages[i].type ||
                    this.#messages[i].type === SnackType.NONE) {
                    continue;
                }
                icon = this.#messages[i].type;
                if (this.#messages[i].type === SnackType.PENDING) {
                    icon = "progress_activity";
                    rotate = true;
                }
                break;
            }
            return html ` ${icon
                ? html `<span
            class=${classMap({
                    "g-icon": true,
                    round: true,
                    filled: true,
                    rotate,
                })}
            >${icon}</span
          >`
                : nothing}
      <div id="messages">
        ${repeat(this.#messages, (message) => message.id, (message) => {
                return html `<div>${message.message}</div>`;
            })}
      </div>
      <div id="actions">
        ${repeat(this.#messages, (message) => message.id, (message) => {
                if (!message.actions) {
                    return nothing;
                }
                return html `${repeat(message.actions, (action) => action.value, (action) => {
                    return html `<button
                  @click=${() => {
                        this.hide();
                        this.dispatchEvent(new SnackbarActionEvent(action.action, action.value, action.callback));
                    }}
                >
                  ${action.title}
                </button>`;
                })}`;
            })}
      </div>
      <button
        id="close"
        @click=${() => {
                this.hide();
                this.dispatchEvent(new SnackbarActionEvent("dismiss"));
            }}
      >
        <span class="g-icon">close</span>
      </button>`;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return Snackbar = _classThis;
})();
export { Snackbar };
//# sourceMappingURL=snackbar.js.map