declare function debug(...args: any[]): void;
declare namespace debug {
    var adapter: (...args: any[]) => void;
}
export { debug };
