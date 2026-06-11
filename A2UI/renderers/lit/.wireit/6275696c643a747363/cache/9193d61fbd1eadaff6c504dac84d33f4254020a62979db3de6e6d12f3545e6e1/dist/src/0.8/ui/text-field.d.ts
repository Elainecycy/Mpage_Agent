import { Root } from "./root.js";
import * as Primitives from "@a2ui/web_core/types/primitives";
import * as Types from "@a2ui/web_core/types/types";
export declare class TextField extends Root {
    #private;
    accessor text: Primitives.StringValue | null;
    accessor label: Primitives.StringValue | null;
    accessor textFieldType: Types.ResolvedTextField["textFieldType"] | null;
    accessor validationRegexp: string | null;
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=text-field.d.ts.map