import { ReactiveController } from "lit";
import { ComponentApi, ResolveA2uiProps, InferredComponentApiSchemaType } from "@a2ui/web_core/v0_9";
import { A2uiLitElement } from "./a2ui-lit-element.js";
/**
 * A Lit ReactiveController that binds an A2UI component context to its API schema.
 *
 * This controller manages the subscription to the GenericBinder, updating the
 * component props and requesting a host update whenever the underlying layer data changes.
 *
 * @template Api The specific A2UI component API interface this controller is bound to.
 */
export declare class A2uiController<Api extends ComponentApi> implements ReactiveController {
    private host;
    /**
     * The current reactive properties of the A2UI component, matching the expected output schema.
     */
    props: ResolveA2uiProps<InferredComponentApiSchemaType<Api>>;
    private binder;
    private subscription?;
    /**
     * Initializes the controller, binding it to the given Lit element and API schema.
     *
     * @param host The A2uiLitElement acting as the component host.
     * @param api The A2UI component API defining the schema for this element.
     */
    constructor(host: A2uiLitElement<any>, api: Api);
    /**
     * Subscribes to the GenericBinder updates when the host connects.
     *
     * Triggers a request update on the host element when new props are received.
     */
    hostConnected(): void;
    /**
     * Unsubscribes from the GenericBinder updates when the host disconnects.
     */
    hostDisconnected(): void;
    /**
     * Disposes the underlying GenericBinder to clean up resources from the context.
     */
    dispose(): void;
}
//# sourceMappingURL=a2ui-controller.d.ts.map