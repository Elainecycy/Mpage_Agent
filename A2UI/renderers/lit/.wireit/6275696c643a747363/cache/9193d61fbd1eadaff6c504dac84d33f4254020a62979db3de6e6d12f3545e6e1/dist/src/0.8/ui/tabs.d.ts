import { PropertyValues } from "lit";
import { Root } from "./root.js";
import * as Primitives from "@a2ui/web_core/types/primitives";
export declare class Tabs extends Root {
    #private;
    accessor titles: Primitives.StringValue[] | null;
    accessor selected: number;
    static styles: import("lit").CSSResultGroup[];
    protected willUpdate(changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=tabs.d.ts.map