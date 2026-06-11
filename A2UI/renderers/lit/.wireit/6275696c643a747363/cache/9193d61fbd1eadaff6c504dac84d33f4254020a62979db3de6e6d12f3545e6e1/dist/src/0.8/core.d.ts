export * as Events from "./events/events.js";
import * as Types from "@a2ui/web_core/types/types";
import * as Guards from "@a2ui/web_core/data/guards";
import { Schemas } from "@a2ui/web_core";
import * as Styles from "@a2ui/web_core/styles/index";
import { A2uiMessageProcessor } from "@a2ui/web_core/data/model-processor";
import * as Primitives from "@a2ui/web_core/types/primitives";
import { create as createSignalA2uiMessageProcessor } from "./data/signal-model-processor.js";
import { Events as WebEvents } from "@a2ui/web_core";
export { Types, Guards, Schemas, Styles, A2uiMessageProcessor, Primitives, WebEvents };
export declare const Data: {
    createSignalA2uiMessageProcessor: typeof createSignalA2uiMessageProcessor;
    A2uiMessageProcessor: typeof A2uiMessageProcessor;
    Guards: typeof Guards;
};
//# sourceMappingURL=core.d.ts.map