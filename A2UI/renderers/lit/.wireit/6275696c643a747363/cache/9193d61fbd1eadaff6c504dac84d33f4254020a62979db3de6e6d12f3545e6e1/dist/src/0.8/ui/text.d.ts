import { Root } from "./root.js";
import * as Primitives from "@a2ui/web_core/types/primitives";
import * as Types from "@a2ui/web_core/types/types";
export declare class Text extends Root {
    #private;
    accessor text: Primitives.StringValue | null;
    accessor usageHint: Types.ResolvedText["usageHint"] | null;
    accessor markdownRenderer: Types.MarkdownRenderer | undefined;
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=text.d.ts.map