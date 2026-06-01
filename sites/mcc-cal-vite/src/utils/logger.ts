type LogValue = unknown;

export function logWarning(message: string, ...details: LogValue[]): void {
  if (import.meta.env.DEV) {
    console.warn(message, ...details);
  }
}

export function logError(message: string, ...details: LogValue[]): void {
  if (import.meta.env.DEV) {
    console.error(message, ...details);
  }
}
