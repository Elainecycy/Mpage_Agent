import { nothing } from 'lit';
import { ButtonApi } from '@a2ui/web_core/v0_9/basic_catalog';
import { BasicCatalogA2uiLitElement } from '../basic-catalog-a2ui-lit-element.js';
import { A2uiController } from '@a2ui/lit/v0_9';
/**
 * A button component that can be used to trigger an action.
 */
export declare class A2uiBasicButtonElement extends BasicCatalogA2uiLitElement<typeof ButtonApi> {
    /**
     * The styles of the button can be customized by redefining the following
     * CSS variables:
     *
     * - Primary variant:
     *   - `--a2ui-color-primary`: The color for the primary variant.
     *   - `--a2ui-color-on-primary`: The color of the text on the primary variant.
     * - Standard/default variant:
     *   - `--a2ui-color-secondary`: The color for the default variant.
     *   - `--a2ui-color-on-secondary`: The color of the text on the default variant.
     * - `--a2ui-button-border`: The styling for the button border. Defaults to `--a2ui-border-width` width and `--a2ui-color-border` color.
     * - `--a2ui-button-border-radius`: The border radius of the button. Defaults to `--a2ui-border-radius`.
     * - `--a2ui-button-padding`: The padding of the button. Defaults to `--a2ui-spacing-m`.
     * - `--a2ui-button-margin`: The outer margin of the button. Defaults to `--a2ui-spacing-m`.
     */
    static styles: import("lit").CSSResult;
    protected createController(): A2uiController<{
        name: string;
        schema: import("zod").ZodObject<{
            child: import("zod").ZodString;
            variant: import("zod").ZodOptional<import("zod").ZodDefault<import("zod").ZodEnum<["default", "primary", "borderless"]>>>;
            action: import("zod").ZodUnion<[import("zod").ZodObject<{
                event: import("zod").ZodObject<{
                    name: import("zod").ZodString;
                    context: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodArray<import("zod").ZodAny, "many">, import("zod").ZodObject<{
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
                    }>]>>>;
                }, "strip", import("zod").ZodTypeAny, {
                    name: string;
                    context?: Record<string, string | number | boolean | any[] | {
                        path: string;
                    } | {
                        call: string;
                        args: Record<string, any>;
                        returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                    }> | undefined;
                }, {
                    name: string;
                    context?: Record<string, string | number | boolean | any[] | {
                        path: string;
                    } | {
                        call: string;
                        args: Record<string, any>;
                        returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                    }> | undefined;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                event: {
                    name: string;
                    context?: Record<string, string | number | boolean | any[] | {
                        path: string;
                    } | {
                        call: string;
                        args: Record<string, any>;
                        returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                    }> | undefined;
                };
            }, {
                event: {
                    name: string;
                    context?: Record<string, string | number | boolean | any[] | {
                        path: string;
                    } | {
                        call: string;
                        args: Record<string, any>;
                        returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                    }> | undefined;
                };
            }>, import("zod").ZodObject<{
                functionCall: import("zod").ZodObject<{
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
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                functionCall: {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                };
            }, {
                functionCall: {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                };
            }>]>;
            checks: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                condition: import("zod").ZodUnion<[import("zod").ZodBoolean, import("zod").ZodObject<{
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
                message: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                message: string;
                condition: boolean | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                };
            }, {
                message: string;
                condition: boolean | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                };
            }>, "many">>;
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
            child: string;
            action: {
                event: {
                    name: string;
                    context?: Record<string, string | number | boolean | any[] | {
                        path: string;
                    } | {
                        call: string;
                        args: Record<string, any>;
                        returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                    }> | undefined;
                };
            } | {
                functionCall: {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                };
            };
            weight?: number | undefined;
            checks?: {
                message: string;
                condition: boolean | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                };
            }[] | undefined;
            variant?: "primary" | "default" | "borderless" | undefined;
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
            child: string;
            action: {
                event: {
                    name: string;
                    context?: Record<string, string | number | boolean | any[] | {
                        path: string;
                    } | {
                        call: string;
                        args: Record<string, any>;
                        returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                    }> | undefined;
                };
            } | {
                functionCall: {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                };
            };
            weight?: number | undefined;
            checks?: {
                message: string;
                condition: boolean | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                };
            }[] | undefined;
            variant?: "primary" | "default" | "borderless" | undefined;
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
export declare const A2uiButton: {
    tagName: string;
    name: string;
    schema: import("zod").ZodObject<{
        child: import("zod").ZodString;
        variant: import("zod").ZodOptional<import("zod").ZodDefault<import("zod").ZodEnum<["default", "primary", "borderless"]>>>;
        action: import("zod").ZodUnion<[import("zod").ZodObject<{
            event: import("zod").ZodObject<{
                name: import("zod").ZodString;
                context: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodArray<import("zod").ZodAny, "many">, import("zod").ZodObject<{
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
                }>]>>>;
            }, "strip", import("zod").ZodTypeAny, {
                name: string;
                context?: Record<string, string | number | boolean | any[] | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                }> | undefined;
            }, {
                name: string;
                context?: Record<string, string | number | boolean | any[] | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                }> | undefined;
            }>;
        }, "strip", import("zod").ZodTypeAny, {
            event: {
                name: string;
                context?: Record<string, string | number | boolean | any[] | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                }> | undefined;
            };
        }, {
            event: {
                name: string;
                context?: Record<string, string | number | boolean | any[] | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                }> | undefined;
            };
        }>, import("zod").ZodObject<{
            functionCall: import("zod").ZodObject<{
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
            }>;
        }, "strip", import("zod").ZodTypeAny, {
            functionCall: {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            };
        }, {
            functionCall: {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            };
        }>]>;
        checks: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            condition: import("zod").ZodUnion<[import("zod").ZodBoolean, import("zod").ZodObject<{
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
            message: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            message: string;
            condition: boolean | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            };
        }, {
            message: string;
            condition: boolean | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            };
        }>, "many">>;
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
        child: string;
        action: {
            event: {
                name: string;
                context?: Record<string, string | number | boolean | any[] | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
                }> | undefined;
            };
        } | {
            functionCall: {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            };
        };
        weight?: number | undefined;
        checks?: {
            message: string;
            condition: boolean | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType: "string" | "number" | "boolean" | "object" | "array" | "void" | "any";
            };
        }[] | undefined;
        variant?: "primary" | "default" | "borderless" | undefined;
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
        child: string;
        action: {
            event: {
                name: string;
                context?: Record<string, string | number | boolean | any[] | {
                    path: string;
                } | {
                    call: string;
                    args: Record<string, any>;
                    returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
                }> | undefined;
            };
        } | {
            functionCall: {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            };
        };
        weight?: number | undefined;
        checks?: {
            message: string;
            condition: boolean | {
                path: string;
            } | {
                call: string;
                args: Record<string, any>;
                returnType?: "string" | "number" | "boolean" | "object" | "array" | "void" | "any" | undefined;
            };
        }[] | undefined;
        variant?: "primary" | "default" | "borderless" | undefined;
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
//# sourceMappingURL=Button.d.ts.map