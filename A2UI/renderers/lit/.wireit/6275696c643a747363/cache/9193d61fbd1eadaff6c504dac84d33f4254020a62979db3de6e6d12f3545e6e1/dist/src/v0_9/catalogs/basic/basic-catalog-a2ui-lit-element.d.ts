import { ComponentApi } from "@a2ui/web_core/v0_9";
import { A2uiLitElement } from "../../a2ui-lit-element.js";
/**
 * A base class for A2UI basic catalog components.
 *
 * Handles some common features of all basic catalog A2ui elements, like
 * injecting the basic CSS styles if needed, and setting the flex property
 * if set by the framework.
 */
export declare abstract class BasicCatalogA2uiLitElement<Api extends ComponentApi> extends A2uiLitElement<Api> {
    connectedCallback(): void;
    updated(changedProperties: Map<PropertyKey, unknown>): void;
}
//# sourceMappingURL=basic-catalog-a2ui-lit-element.d.ts.map