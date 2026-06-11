import { nothing } from "lit";
import { ModalApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
import { A2uiController } from "@a2ui/lit/v0_9";
export declare class A2uiLitModal extends BasicCatalogA2uiLitElement<typeof ModalApi> {
    /**
     * The styles of the modal can be customized by redefining the following
     * CSS variables:
     *
     * - `--a2ui-modal-backdrop-bg`: Controls the backdrop color of the dialog.
     * - `--a2ui-modal-padding`: Padding inside the dialog content area. Defaults to `24px`.
     * - `--a2ui-modal-border-radius`: Border radius of the dialog. Defaults to `8px`.
     */
    static styles: import("lit").CSSResult;
    protected createController(): A2uiController<{
        name: string;
        schema: import("zod").ZodObject<{
            trigger: import("zod").ZodString;
            content: import("zod").ZodString;
            accessibility: import("zod").ZodOptional<import("zod").ZodObject<{
                label: import("zod").ZodOptional<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodObject<{
                    path: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    path: string;
                }, {
                    path: string;
                }>, import("zod").ZodObject<{
                    call: import("zod").ZodString;
                    args: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>;
                    returnType: import("zod").ZodDefault<import("zod").ZodEnum<["string", "number", "boolean", "array", "object", "any", "void"]>>;
                }, "strip", import("zod").ZodTypeAny, {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                }, {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                }>]>>;
                description: import("zod").ZodOptional<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodObject<{
                    path: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    path: string;
                }, {
                    path: string;
                }>, import("zod").ZodObject<{
                    call: import("zod").ZodString;
                    args: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>;
                    returnType: import("zod").ZodDefault<import("zod").ZodEnum<["string", "number", "boolean", "array", "object", "any", "void"]>>;
                }, "strip", import("zod").ZodTypeAny, {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                }, {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                }>]>>;
            }, "strip", import("zod").ZodTypeAny, {
                description?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                } | undefined;
                label?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                } | undefined;
            }, {
                description?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                } | undefined;
                label?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                } | undefined;
            }>>;
            weight: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, "strict", import("zod").ZodTypeAny, {
            trigger: string;
            content: string;
            weight?: number | undefined;
            accessibility?: {
                description?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                } | undefined;
                label?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                } | undefined;
            } | undefined;
        }, {
            trigger: string;
            content: string;
            weight?: number | undefined;
            accessibility?: {
                description?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                } | undefined;
                label?: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                } | undefined;
            } | undefined;
        }>;
    }>;
    accessor dialog: HTMLDialogElement;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export declare const A2uiModal: {
    tagName: string;
    name: string;
    schema: import("zod").ZodObject<{
        trigger: import("zod").ZodString;
        content: import("zod").ZodString;
        accessibility: import("zod").ZodOptional<import("zod").ZodObject<{
            label: import("zod").ZodOptional<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodObject<{
                path: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                path: string;
            }, {
                path: string;
            }>, import("zod").ZodObject<{
                call: import("zod").ZodString;
                args: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>;
                returnType: import("zod").ZodDefault<import("zod").ZodEnum<["string", "number", "boolean", "array", "object", "any", "void"]>>;
            }, "strip", import("zod").ZodTypeAny, {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            }, {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            }>]>>;
            description: import("zod").ZodOptional<import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodObject<{
                path: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                path: string;
            }, {
                path: string;
            }>, import("zod").ZodObject<{
                call: import("zod").ZodString;
                args: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>;
                returnType: import("zod").ZodDefault<import("zod").ZodEnum<["string", "number", "boolean", "array", "object", "any", "void"]>>;
            }, "strip", import("zod").ZodTypeAny, {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            }, {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            }>]>>;
        }, "strip", import("zod").ZodTypeAny, {
            description?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            } | undefined;
            label?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            } | undefined;
        }, {
            description?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            } | undefined;
            label?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            } | undefined;
        }>>;
        weight: import("zod").ZodOptional<import("zod").ZodNumber>;
    }, "strict", import("zod").ZodTypeAny, {
        trigger: string;
        content: string;
        weight?: number | undefined;
        accessibility?: {
            description?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            } | undefined;
            label?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            } | undefined;
        } | undefined;
    }, {
        trigger: string;
        content: string;
        weight?: number | undefined;
        accessibility?: {
            description?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            } | undefined;
            label?: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            } | undefined;
        } | undefined;
    }>;
};
//# sourceMappingURL=Modal.d.ts.map