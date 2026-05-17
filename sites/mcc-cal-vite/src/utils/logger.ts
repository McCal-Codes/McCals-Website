type LogValue = unknown;

export function logWarning(message: string, ...details: LogValue[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- Development-only diagnostics.
    console.warn(message, ...details);
  }
}

export function logError(message: string, ...details: LogValue[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- Development-only diagnostics.
    console.error(message, ...details);
  }
}
