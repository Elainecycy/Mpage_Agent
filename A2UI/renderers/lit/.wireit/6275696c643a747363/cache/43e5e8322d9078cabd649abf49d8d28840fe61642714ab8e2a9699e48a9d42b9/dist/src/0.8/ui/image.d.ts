import { Root } from './root.js';
import * as Primitives from '@a2ui/web_core/types/primitives';
import * as Types from '@a2ui/web_core/types/types';
export declare class Image extends Root {
    #private;
    accessor url: Primitives.StringValue | null;
    accessor altText: Primitives.StringValue | null;
    accessor usageHint: Types.ResolvedImage['usageHint'] | null;
    accessor fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | null;
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=image.d.ts.map