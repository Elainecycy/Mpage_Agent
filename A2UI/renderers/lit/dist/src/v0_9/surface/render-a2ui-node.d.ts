import { nothing } from 'lit';
import { ComponentContext, Catalog } from '@a2ui/web_core/v0_9';
import { LitComponentApi } from '@a2ui/lit/v0_9';
/**
 * Pure function that acts as a generic container for A2UI components.
 *
 * It dynamically resolves and renders the specific Lit component implementation
 * based on the component type provided in the context, returning a TemplateResult directly
 * to avoid duplicate DOM node wrapping.
 *
 * @param context The component context defining the data model and type to render.
 * @param catalog The catalog of component implementations.
 * @returns A Lit TemplateResult representing the resolved component, or `nothing` if the component is invalid or unresolvable.
 *
 * This method should be used directly very rarely. Instead, programmers should use
 * the `renderNode` method on the base `A2uiLitElement` class, which handles context
 * creation automatically.
 */
export declare function renderA2uiNode(context: ComponentContext, catalog: Catalog<LitComponentApi>): import("lit-html").TemplateResult | typeof nothing;
//# sourceMappingURL=render-a2ui-node.d.ts.map