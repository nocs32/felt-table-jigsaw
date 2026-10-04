type LogLevel = 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

const write = (level: LogLevel, message: string, context: LogContext = {}): void => {
  const line = JSON.stringify({ time: new Date().toISOString(), level, message, ...context });

  console[level](line);
};

export const logger = {
  info: (message: string, context?: LogContext): void => write('info', message, context),
  warn: (message: string, context?: LogContext): void => write('warn', message, context),
  error: (message: string, context?: LogContext): void => write('error', message, context),
};
