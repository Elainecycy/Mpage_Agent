import { LitElement, nothing } from 'lit';
import { ComponentContext, ComponentApi } from '@a2ui/web_core/v0_9';
import { A2uiController } from '@a2ui/lit/v0_9';
/**
 * Represents a reference to a child component that should be rendered.
 * In A2UI, a child can be provided in one of three ways:
 *
 * 1. A string ID (e.g., "submit_button"). Tells the renderer to look up the component
 *    from the Surface's registry. The child will inherit the parent's data context path.
 * 2. A reference object (e.g., { id: 'foo', basePath: '/bar' }). Tells the renderer where
 *    to find the component AND binds it to a specific slice of the data model.
 * 3. An inline component object (e.g., { type: 'Button', props: { ... } }). Provides the
 *    full component definition directly instead of looking it up by ID.
 *
 * (This probably should come from the binder in web_core!)
 */
type A2uiChildRef = string | {
    id?: string;
    basePath?: string;
    type?: string;
};
/**
 * A base class for A2UI Lit elements that manages the A2uiController lifecycle.
 *
 * This element handles the reactive attachment and detachment of the `A2uiController`
 * whenever the component's `context` changes. Subclasses only need to implement
 * `createController` to provide their specific schema-bound controller, and `render`
 * to define the template based on the controller's reactive props.
 *
 * @template Api The specific A2UI component API defining the schema for this element.
 */
export declare abstract class A2uiLitElement<Api extends ComponentApi> extends LitElement {
    accessor context: ComponentContext;
    protected controller: A2uiController<Api>;
    /**
     * Instantiates the unique controller for this element's specific bound API.
     *
     * Subclasses must implement this method to return an `A2uiController` tied to
     * their specific component `Api` definition.
     *
     * @returns A new instance of `A2uiController` matching the component API.
     */
    protected abstract createController(): A2uiController<Api>;
    /**
     * Helper method to render a child A2UI node.
     * Abstracts away the need to manually create a ComponentContext.
     *
     * @param childRef The reference to the child component to render. Can be a string ID,
     *                 a reference object containing `{ id, basePath }`, or a full inline component definition.
     * @param customPath An explicit data model path to bind the child to. If provided,
     *                   this completely overrides any path defined in the `childRef` object.
     *                   If omitted, it falls back to the `childRef`'s `basePath`, or the current component's path.
     *
     * @returns A Lit template result containing the rendered child component, or `nothing` if the reference is empty.
     */
    protected renderNode(childRef?: A2uiChildRef, customPath?: string): import("lit-html").TemplateResult | typeof nothing;
    /**
     * Reacts to changes in the component's properties.
     *
     * Specifically, when the `context` property changes or is initialized, this method
     * cleans up any existing controller and invokes `createController()` to bind to
     * the new context.
     */
    willUpdate(changedProperties: Map<string, any>): void;
}
export {};
//# sourceMappingURL=a2ui-lit-element.d.ts.map