import { LitElement } from 'lit';
import { AppConfig } from './configs/configs.js';
type MarkdownRendererFn = (value: string, options?: any) => Promise<string>;
declare const A2UILayoutEditor_base: typeof LitElement;
export declare class A2UILayoutEditor extends A2UILayoutEditor_base {
    #private;
    accessor markdownRenderer: MarkdownRendererFn;
    accessor config: AppConfig;
    static styles: import("lit").CSSResult[];
    private accessor snackbar;
    connectedCallback(): void;
    protected firstUpdated(): void;
    render(): (symbol | import("lit-html").TemplateResult<1>)[];
    showToast(msg: string, type?: string): void;
}
export {};
//# sourceMappingURL=app.d.ts.map