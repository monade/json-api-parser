declare const DEBUG: {
    ACCESSING_NOT_INCLUDED_MODEL: "ACCESSING_NOT_INCLUDED_MODEL";
    UNDECLARED_RELATIONSHOP: "UNDECLARED_RELATIONSHOP";
    MISSING_RELATIONSHIP: "MISSING_RELATIONSHIP";
    UNDECLARED_ATTRIBUTE: "UNDECLARED_ATTRIBUTE";
    MISSING_ATTRIBUTE: "MISSING_ATTRIBUTE";
    SKIPPED_INCLUDED_RELATIONSHIP: "SKIPPED_INCLUDED_RELATIONSHIP";
};
type DebugMetadata = {
    type: keyof typeof DEBUG;
    [key: string]: unknown;
};
declare function debug(level: 'info' | 'warn' | 'error', message: string, meta?: DebugMetadata): void;
declare namespace debug {
    var adapter: (level: "error" | "info" | "warn", message: string, meta?: DebugMetadata | undefined) => void;
}
export { debug, DEBUG };
