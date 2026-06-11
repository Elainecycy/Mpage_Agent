import { LitElement } from "lit";
import { SnackbarMessage, SnackbarUUID } from "../types/types";
export declare class Snackbar extends LitElement {
    #private;
    accessor active: boolean;
    accessor error: boolean;
    accessor timeout: number;
    static styles: import("lit").CSSResult[];
    show(message: SnackbarMessage, replaceAll?: boolean): `${string}-${string}-${string}-${string}-${string}`;
    hide(id?: SnackbarUUID): void;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=snackbar.d.ts.map