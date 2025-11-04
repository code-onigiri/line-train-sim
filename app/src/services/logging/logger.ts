/**
 * Logging infrastructure with levels and structured data
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private entries: LogEntry[] = [];
  private maxEntries = 1000;

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, {
      ...data,
      error: error?.message,
      stack: error?.stack,
    });
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Console output
    const levelName = LogLevel[level];
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(`[${levelName}] ${message}`, data || '');
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  public getEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.entries.filter((e) => e.level === level);
    }
    return [...this.entries];
  }

  public clear(): void {
    this.entries = [];
  }
}

// Singleton instance
const logger = new Logger();

export function getLogger(): Logger {
  return logger;
}

// Convenience exports
export const debug = (message: string, data?: Record<string, unknown>) =>
  logger.debug(message, data);
export const info = (message: string, data?: Record<string, unknown>) => logger.info(message, data);
export const warn = (message: string, data?: Record<string, unknown>) => logger.warn(message, data);
export const error = (message: string, err?: Error, data?: Record<string, unknown>) =>
  logger.error(message, err, data);
