declare const _default: () => Promise<{
    plugins: import("vite").Plugin<any>[];
    build: {
        rollupOptions: {
            input: Record<string, string>;
        };
        target: string;
    };
    define: {};
    resolve: {
        dedupe: string[];
    };
}>;
export default _default;
//# sourceMappingURL=vite.config.d.ts.map