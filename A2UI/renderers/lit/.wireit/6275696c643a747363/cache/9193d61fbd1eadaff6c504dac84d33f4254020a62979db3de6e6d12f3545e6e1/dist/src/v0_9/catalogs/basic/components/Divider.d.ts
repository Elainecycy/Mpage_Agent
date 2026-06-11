import { nothing } from "lit";
import { DividerApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { A2uiController } from "@a2ui/lit/v0_9";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
export declare class A2uiDividerElement extends BasicCatalogA2uiLitElement<typeof DividerApi> {
    /**
     * The styles of the divider can be customized by redefining the following
     * CSS variables:
     *
     * - `--a2ui-divider-border`: The styling for the divider border. Defaults to `--a2ui-border-width` solid `--a2ui-color-border`.
     * - `--a2ui-divider-spacing`: The spacing around the divider. Defaults to `--a2ui-spacing-m`.
     */
    static styles: import("lit").CSSResult;
    protected createController(): A2uiController<{
        name: string;
        schema: import("zod").ZodObject<{
            axis: import("zod").ZodOptional<import("zod").ZodDefault<import("zod").ZodEnum<["horizontal", "vertical"]>>>;
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
            axis?: "horizontal" | "vertical" | undefined;
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
            axis?: "horizontal" | "vertical" | undefined;
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
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export declare const A2uiDivider: {
    tagName: string;
    name: string;
    schema: import("zod").ZodObject<{
        axis: import("zod").ZodOptional<import("zod").ZodDefault<import("zod").ZodEnum<["horizontal", "vertical"]>>>;
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
        axis?: "horizontal" | "vertical" | undefined;
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
        axis?: "horizontal" | "vertical" | undefined;
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
//# sourceMappingURL=Divider.d.ts.map