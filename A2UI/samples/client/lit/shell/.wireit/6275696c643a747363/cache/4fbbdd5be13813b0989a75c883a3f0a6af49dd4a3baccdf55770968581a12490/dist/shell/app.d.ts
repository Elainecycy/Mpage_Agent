import { LitElement } from "lit";
import { AppConfig } from "./configs/configs.js";
declare const A2UILayoutEditor_base: typeof LitElement;
export declare class A2UILayoutEditor extends A2UILayoutEditor_base {
    #private;
    accessor markdownRenderer: any;
    accessor config: AppConfig;
    static styles: import("lit").CSSResult[];
    connectedCallback(): void;
    protected firstUpdated(): void;
    render(): (symbol | import("lit-html").TemplateResult<1>)[];
}
export {};
//# sourceMappingURL=app.d.ts.map