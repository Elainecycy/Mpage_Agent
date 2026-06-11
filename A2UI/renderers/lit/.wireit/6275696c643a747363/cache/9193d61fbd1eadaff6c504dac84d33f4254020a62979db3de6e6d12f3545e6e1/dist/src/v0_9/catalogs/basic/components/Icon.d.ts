import { nothing } from "lit";
import { IconApi } from "@a2ui/web_core/v0_9/basic_catalog";
import { BasicCatalogA2uiLitElement } from "../basic-catalog-a2ui-lit-element.js";
import { A2uiController } from "@a2ui/lit/v0_9";
export declare class A2uiIconElement extends BasicCatalogA2uiLitElement<typeof IconApi> {
    /**
     * The icon component can be customized with the following CSS variables:
     *
     * - `--a2ui-icon-size`: Dimensions of the icon.
     * - `--a2ui-icon-color`: Color tint applied to the icon.
     * - `--a2ui-icon-font-family`: Override the font family for icons. Defaults to Material Symbols Outlined.
     * - `--a2ui-icon-font-variation-settings`: Complete override for font-variation-settings.
     */
    static styles: import("lit").CSSResult;
    protected createController(): A2uiController<{
        name: string;
        schema: import("zod").ZodObject<{
            name: import("zod").ZodUnion<[import("zod").ZodEnum<["accountCircle", "add", "arrowBack", "arrowForward", "attachFile", "calendarToday", "call", "camera", "check", "close", "delete", "download", "edit", "event", "error", "fastForward", "favorite", "favoriteOff", "folder", "help", "home", "info", "locationOn", "lock", "lockOpen", "mail", "menu", "moreVert", "moreHoriz", "notificationsOff", "notifications", "pause", "payment", "person", "phone", "photo", "play", "print", "refresh", "rewind", "search", "send", "settings", "share", "shoppingCart", "skipNext", "skipPrevious", "star", "starHalf", "starOff", "stop", "upload", "visibility", "visibilityOff", "volumeDown", "volumeMute", "volumeOff", "volumeUp", "warning"]>, import("zod").ZodObject<{
                path: import("zod").ZodString;
            }, "strict", import("zod").ZodTypeAny, {
                path: string;
            }, {
                path: string;
            }>]>;
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
            name: "error" | "accountCircle" | "add" | "arrowBack" | "arrowForward" | "attachFile" | "calendarToday" | "call" | "camera" | "check" | "close" | "delete" | "download" | "edit" | "event" | "favorite" | "favoriteOff" | "folder" | "help" | "home" | "info" | "locationOn" | "lock" | "lockOpen" | "mail" | "menu" | "moreVert" | "moreHoriz" | "notificationsOff" | "notifications" | "payment" | "person" | "phone" | "photo" | "print" | "refresh" | "search" | "send" | "settings" | "share" | "shoppingCart" | "star" | "starHalf" | "starOff" | "upload" | "visibility" | "visibilityOff" | "warning" | "fastForward" | "pause" | "play" | "rewind" | "skipNext" | "skipPrevious" | "stop" | "volumeDown" | "volumeMute" | "volumeOff" | "volumeUp" | {
                path: string;
            };
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
            name: "error" | "accountCircle" | "add" | "arrowBack" | "arrowForward" | "attachFile" | "calendarToday" | "call" | "camera" | "check" | "close" | "delete" | "download" | "edit" | "event" | "favorite" | "favoriteOff" | "folder" | "help" | "home" | "info" | "locationOn" | "lock" | "lockOpen" | "mail" | "menu" | "moreVert" | "moreHoriz" | "notificationsOff" | "notifications" | "payment" | "person" | "phone" | "photo" | "print" | "refresh" | "search" | "send" | "settings" | "share" | "shoppingCart" | "star" | "starHalf" | "starOff" | "upload" | "visibility" | "visibilityOff" | "warning" | "fastForward" | "pause" | "play" | "rewind" | "skipNext" | "skipPrevious" | "stop" | "volumeDown" | "volumeMute" | "volumeOff" | "volumeUp" | {
                path: string;
            };
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
export declare const A2uiIcon: {
    tagName: string;
    name: string;
    schema: import("zod").ZodObject<{
        name: import("zod").ZodUnion<[import("zod").ZodEnum<["accountCircle", "add", "arrowBack", "arrowForward", "attachFile", "calendarToday", "call", "camera", "check", "close", "delete", "download", "edit", "event", "error", "fastForward", "favorite", "favoriteOff", "folder", "help", "home", "info", "locationOn", "lock", "lockOpen", "mail", "menu", "moreVert", "moreHoriz", "notificationsOff", "notifications", "pause", "payment", "person", "phone", "photo", "play", "print", "refresh", "rewind", "search", "send", "settings", "share", "shoppingCart", "skipNext", "skipPrevious", "star", "starHalf", "starOff", "stop", "upload", "visibility", "visibilityOff", "volumeDown", "volumeMute", "volumeOff", "volumeUp", "warning"]>, import("zod").ZodObject<{
            path: import("zod").ZodString;
        }, "strict", import("zod").ZodTypeAny, {
            path: string;
        }, {
            path: string;
        }>]>;
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
        name: "error" | "accountCircle" | "add" | "arrowBack" | "arrowForward" | "attachFile" | "calendarToday" | "call" | "camera" | "check" | "close" | "delete" | "download" | "edit" | "event" | "favorite" | "favoriteOff" | "folder" | "help" | "home" | "info" | "locationOn" | "lock" | "lockOpen" | "mail" | "menu" | "moreVert" | "moreHoriz" | "notificationsOff" | "notifications" | "payment" | "person" | "phone" | "photo" | "print" | "refresh" | "search" | "send" | "settings" | "share" | "shoppingCart" | "star" | "starHalf" | "starOff" | "upload" | "visibility" | "visibilityOff" | "warning" | "fastForward" | "pause" | "play" | "rewind" | "skipNext" | "skipPrevious" | "stop" | "volumeDown" | "volumeMute" | "volumeOff" | "volumeUp" | {
            path: string;
        };
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
        name: "error" | "accountCircle" | "add" | "arrowBack" | "arrowForward" | "attachFile" | "calendarToday" | "call" | "camera" | "check" | "close" | "delete" | "download" | "edit" | "event" | "favorite" | "favoriteOff" | "folder" | "help" | "home" | "info" | "locationOn" | "lock" | "lockOpen" | "mail" | "menu" | "moreVert" | "moreHoriz" | "notificationsOff" | "notifications" | "payment" | "person" | "phone" | "photo" | "print" | "refresh" | "search" | "send" | "settings" | "share" | "shoppingCart" | "star" | "starHalf" | "starOff" | "upload" | "visibility" | "visibilityOff" | "warning" | "fastForward" | "pause" | "play" | "rewind" | "skipNext" | "skipPrevious" | "stop" | "volumeDown" | "volumeMute" | "volumeOff" | "volumeUp" | {
            path: string;
        };
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
//# sourceMappingURL=Icon.d.ts.map