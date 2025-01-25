function debug(level: 'info' | 'warn' | 'error', ...args: any[]) {
  debug.adapter(level, ...args);
}

debug.adapter = (level: 'info' | 'warn' | 'error', ...args: any[]) => {
  switch (level) {
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
    case 'info':
    default:
      console.log(...args);
      break;
  }
}

export { debug };
