import { nothing } from 'lit';
import { TabsApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
export declare class A2uiLitTabs extends BasicCatalogA2uiLitElement<typeof TabsApi> {
    /**
     * The styles of the tabs can be customized by redefining the following
     * CSS variables:
     *
     * - `--a2ui-tabs-header-background`: Default transparent.
     * - `--a2ui-tabs-header-background-active`: Default `--a2ui-color-secondary`.
     * - `--a2ui-tabs-header-color`: Default `--a2ui-color-on-surface`.
     * - `--a2ui-tabs-header-color-active`: Default `--a2ui-color-on-secondary`.
     * - `--a2ui-tabs-border`: Default `--a2ui-border-width` solid `--a2ui-color-border`.
     * - `--a2ui-tabs-content-padding`: Default `0 var(--a2ui-spacing-m, 0.5rem)`.
     */
    static styles: import("lit").CSSResult;
    protected createController(): A2uiController<{
        name: string;
        schema: import("zod").ZodObject<{
            tabs: import("zod").ZodArray<import("zod").ZodObject<{
                title: import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodObject<{
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
                }>]>;
                child: import("zod").ZodString;
            }, "strict", import("zod").ZodTypeAny, {
                title: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                };
                child: string;
            }, {
                title: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                };
                child: string;
            }>, "many">;
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
            tabs: {
                title: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                };
                child: string;
            }[];
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
            tabs: {
                title: string | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                };
                child: string;
            }[];
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
    accessor activeIndex: number;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export declare const A2uiTabs: {
    tagName: string;
    name: string;
    schema: import("zod").ZodObject<{
        tabs: import("zod").ZodArray<import("zod").ZodObject<{
            title: import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodObject<{
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
            }>]>;
            child: import("zod").ZodString;
        }, "strict", import("zod").ZodTypeAny, {
            title: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            };
            child: string;
        }, {
            title: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            };
            child: string;
        }>, "many">;
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
        tabs: {
            title: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            };
            child: string;
        }[];
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
        tabs: {
            title: string | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            };
            child: string;
        }[];
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
//# sourceMappingURL=Tabs.d.ts.map