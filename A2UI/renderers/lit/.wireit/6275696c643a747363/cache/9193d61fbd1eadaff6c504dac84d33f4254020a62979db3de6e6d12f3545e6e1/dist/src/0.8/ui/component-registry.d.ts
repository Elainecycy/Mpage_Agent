import { CustomElementConstructorOf } from "./ui.js";
export declare class ComponentRegistry {
    private schemas;
    private registry;
    register(typeName: string, constructor: CustomElementConstructorOf<HTMLElement>, tagName?: string, schema?: unknown): void;
    get(typeName: string): CustomElementConstructorOf<HTMLElement> | undefined;
    getInlineCatalog(): {
        components: {
            [key: string]: unknown;
        };
    };
}
export declare const componentRegistry: ComponentRegistry;
//# sourceMappingURL=component-registry.d.ts.map