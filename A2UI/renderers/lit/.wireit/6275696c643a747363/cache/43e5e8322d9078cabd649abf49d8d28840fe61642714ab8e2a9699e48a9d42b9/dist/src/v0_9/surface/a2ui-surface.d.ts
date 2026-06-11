import { nothing, LitElement, PropertyValues } from 'lit';
import { SurfaceModel } from '@a2ui/web_core/v0_9';
import { LitComponentApi } from '@a2ui/lit/v0_9';
/**
 * A Lit component that renders an A2UI Surface.
 *
 * This component takes a `SurfaceModel` and dynamically renders the root component
 * and its children using the provided catalog. It handles loading states if the
 * root component is not yet available.
 *
 * @element a2ui-surface
 */
export declare class A2uiSurface extends LitElement {
    /**
     * The surface model containing the component tree and catalog.
     */
    accessor surface: SurfaceModel<LitComponentApi> | undefined;
    /**
     * Internal state indicating whether the root component exists.
     * @internal
     */
    accessor _hasRoot: boolean;
    /**
     * Subscription cleanup function.
     * @internal
     */
    private unsubscribe?;
    /**
     * Handles lifecycle updates, specifically when the `surface` property changes.
     *
     * It manages subscriptions to the components model to detect when the 'root'
     * component is created.
     *
     * @param changedProperties Map of changed properties.
     */
    protected willUpdate(changedProperties: PropertyValues): void;
    /**
     * Cleans up subscriptions.
     */
    disconnectedCallback(): void;
    /**
     * Renders the surface.
     *
     * If `surface` is not set, returns `nothing`.
     * If the root component is not yet available, renders a loading state.
     * Otherwise, renders the root component using `renderA2uiNode`.
     */
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=a2ui-surface.d.ts.map