import { nothing } from "lit";
import * as Types from "@a2ui/web_core/types/types";
import { A2uiMessageProcessor } from "@a2ui/web_core/data/model-processor";
import { Root } from "./root.js";
export declare class Surface extends Root {
    #private;
    accessor surfaceId: Types.SurfaceID | null;
    accessor surface: Types.Surface | null;
    accessor processor: A2uiMessageProcessor | null;
    static styles: import("lit").CSSResult[];
    accessor enableCustomElements: boolean;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=surface.d.ts.map