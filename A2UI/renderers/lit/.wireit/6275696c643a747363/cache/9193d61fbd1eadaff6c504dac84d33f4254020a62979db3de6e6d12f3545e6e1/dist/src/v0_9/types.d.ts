import { ComponentApi } from "@a2ui/web_core/v0_9";
/**
 * Interface representing an A2UI component implementation in Lit.
 *
 * Extends the framework-agnostic component API to include the Lit custom element
 * tag name. Used by A2uiNode to dynamically render the corresponding Lit component,
 * and as the type parameter when defining custom Catalogs.
 */
export interface LitComponentApi extends ComponentApi {
    tagName: string;
}
//# sourceMappingURL=types.d.ts.map