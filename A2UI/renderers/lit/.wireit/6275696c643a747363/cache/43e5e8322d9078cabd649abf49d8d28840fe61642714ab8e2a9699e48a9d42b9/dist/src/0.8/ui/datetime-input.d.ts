import { nothing } from 'lit';
import { Root } from './root.js';
import * as Primitives from '@a2ui/web_core/types/primitives';
export declare class DateTimeInput extends Root {
    #private;
    accessor value: Primitives.StringValue | null;
    accessor label: Primitives.StringValue | null;
    accessor enableDate: boolean;
    accessor enableTime: boolean;
    static styles: import("lit").CSSResultGroup[];
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=datetime-input.d.ts.map