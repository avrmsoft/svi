// src/utils/logger.ts

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  DEBUG = "DEBUG",
  TRACE = "TRACE",
}

// ANSI-Colors
const colors = {
  reset: "\x1b[0m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgCyan: "\x1b[36m",
};

export default class Logger {
  private static logLevel: LogLevel = LogLevel.INFO;

  static setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  static info(message: string) {
    if (this.logLevel === LogLevel.WARN || this.logLevel === LogLevel.ERROR) {
      return;
    }
    console.log(`${colors.fgBlue}[${LogLevel.INFO}]${colors.reset} ${message}`);
  }

  static success(message: string) {
    if (this.logLevel === LogLevel.WARN || this.logLevel === LogLevel.ERROR) {
      return;
    }
    console.log(
      `${colors.fgGreen}[${LogLevel.SUCCESS}]${colors.reset} ${message}`
    );
  }

  static warn(message: string) {
    if (this.logLevel === LogLevel.ERROR) {
      return;
    }
    console.warn(
      `${colors.fgYellow}[${LogLevel.WARN}]${colors.reset} ${message}`
    );
  }

  static error(message: string, err?: any) {
    console.error(
      `${colors.fgRed}[${LogLevel.ERROR}]${colors.reset} ${message}`
    );
    if (err) {
      console.error(err);
    }
  }

  static debug(message: string) {
    if (
      this.logLevel === LogLevel.WARN ||
      this.logLevel === LogLevel.ERROR ||
      this.logLevel === LogLevel.INFO ||
      this.logLevel === LogLevel.SUCCESS
    ) {
      return;
    }
    if (process.env.DEBUG === "true") {
      console.log(
        `${colors.fgCyan}[${LogLevel.DEBUG}]${colors.reset} ${message}`
      );
    }
  }

  static trace(message: string) {
    if (this.logLevel !== LogLevel.TRACE) {
      return;
    }
    if (process.env.DEBUG === "true") {
      console.log(
        `${colors.fgCyan}[${LogLevel.TRACE}]${colors.reset} ${message}`
      );
    }
  }
}
