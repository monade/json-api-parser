function debug(...args: any[]) {
  debug.adapter(...args);
}

debug.adapter = (...args: any[]) => console.warn(...args);

export { debug };
