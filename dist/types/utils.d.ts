declare function debug(level: 'info' | 'warn' | 'error', ...args: any[]): void;
declare namespace debug {
    var adapter: (level: "error" | "info" | "warn", ...args: any[]) => void;
}
export { debug };
