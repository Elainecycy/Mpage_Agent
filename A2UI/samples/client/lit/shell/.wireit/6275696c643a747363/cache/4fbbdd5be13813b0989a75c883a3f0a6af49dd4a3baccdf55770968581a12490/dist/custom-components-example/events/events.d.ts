import { HTMLTemplateResult } from "lit";
export declare class SnackbarActionEvent extends Event {
    readonly action: string;
    readonly value?: HTMLTemplateResult | string;
    readonly callback?: () => void;
    static eventName: string;
    constructor(action: string, value?: HTMLTemplateResult | string, callback?: () => void);
}
//# sourceMappingURL=events.d.ts.map