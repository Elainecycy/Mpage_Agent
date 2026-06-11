import { Directive, DirectiveParameters, Part } from "lit/directive.js";
import * as Types from "@a2ui/web_core/types/types";
declare class MarkdownDirective extends Directive {
    private lastValue;
    private lastTagClassMap;
    update(_part: Part, [value, markdownRenderer, markdownOptions]: DirectiveParameters<this>): import("lit-html/directive.js").DirectiveResult<{
        new (_partInfo: import("lit-html/directive.js").PartInfo): import("lit-html/directives/until.js").UntilDirective<import("lit-html").TemplateResult<1> | Promise<import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/unsafe-html.js").UnsafeHTMLDirective>>>;
    }>;
    private static defaultMarkdownWarningLogged;
    /**
     * Renders the markdown string to HTML using the injected markdown renderer,
     * if present. Otherwise, it returns the value wrapped in a span.
     */
    render(value: string, markdownRenderer?: Types.MarkdownRenderer, markdownOptions?: Types.MarkdownRendererOptions): import("lit-html/directive.js").DirectiveResult<{
        new (_partInfo: import("lit-html/directive.js").PartInfo): import("lit-html/directives/until.js").UntilDirective<import("lit-html").TemplateResult<1> | Promise<import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/unsafe-html.js").UnsafeHTMLDirective>>>;
    }>;
}
export declare const markdown: (value: string, markdownRenderer?: Types.MarkdownRenderer | undefined, markdownOptions?: Types.MarkdownRendererOptions | undefined) => import("lit-html/directive.js").DirectiveResult<typeof MarkdownDirective>;
export {};
//# sourceMappingURL=markdown.d.ts.map