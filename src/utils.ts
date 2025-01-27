const DEBUG = {
  ACCESSING_NOT_INCLUDED_MODEL: 'ACCESSING_NOT_INCLUDED_MODEL' as const,
  UNDECLARED_RELATIONSHOP: 'UNDECLARED_RELATIONSHOP' as const,
  MISSING_RELATIONSHIP: 'MISSING_RELATIONSHIP' as const,
  UNDECLARED_ATTRIBUTE: 'UNDECLARED_ATTRIBUTE' as const,
  MISSING_ATTRIBUTE: 'MISSING_ATTRIBUTE' as const,
  SKIPPED_INCLUDED_RELATIONSHIP: 'SKIPPED_INCLUDED_RELATIONSHIP' as const,
};

type DebugMetadata = {
  type: keyof typeof DEBUG;
  [key: string]: unknown;
}

function debug(level: 'info' | 'warn' | 'error', message: string, meta?: DebugMetadata) {
  debug.adapter(level, message, meta);
}

debug.adapter = (level: 'info' | 'warn' | 'error', message: string, meta?: DebugMetadata) => {
  switch (level) {
    case 'warn':
      console.warn(message, meta);
      break;
    case 'error':
      console.error(message, meta);
      break;
    case 'info':
    default:
      console.log(message, meta);
      break;
  }
}


export { debug, DEBUG };
