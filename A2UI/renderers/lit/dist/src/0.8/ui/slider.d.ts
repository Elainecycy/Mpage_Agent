import { nothing } from 'lit';
import { Root } from './root.js';
import * as Primitives from '@a2ui/web_core/types/primitives';
export declare class Slider extends Root {
    #private;
    accessor value: Primitives.NumberValue | null;
    accessor minValue: number;
    accessor maxValue: number;
    accessor label: Primitives.StringValue | null;
    static styles: import("lit").CSSResultGroup[];
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=slider.d.ts.map