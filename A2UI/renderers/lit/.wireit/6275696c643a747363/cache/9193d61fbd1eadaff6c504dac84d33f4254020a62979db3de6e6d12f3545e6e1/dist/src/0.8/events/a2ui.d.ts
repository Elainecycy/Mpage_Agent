import * as Types from "@a2ui/web_core/types/types";
import { BaseEventDetail } from "./base.js";
type Namespace = "a2ui";
export interface A2UIAction extends BaseEventDetail<`${Namespace}.action`> {
    readonly action: Types.Action;
    readonly dataContextPath: string;
    readonly sourceComponentId: string;
    readonly sourceComponent: Types.AnyComponentNode | null;
}
export {};
//# sourceMappingURL=a2ui.d.ts.map