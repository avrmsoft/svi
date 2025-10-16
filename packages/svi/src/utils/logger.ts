// src/utils/logger.ts

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  DEBUG = "DEBUG",
}

// ANSI-Farben
const colors = {
  reset: "\x1b[0m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgCyan: "\x1b[36m",
};

export default class Logger {
  static info(message: string) {
    console.log(`${colors.fgBlue}[${LogLevel.INFO}]${colors.reset} ${message}`);
  }

  static success(message: string) {
    console.log(`${colors.fgGreen}[${LogLevel.SUCCESS}]${colors.reset} ${message}`);
  }

  static warn(message: string) {
    console.warn(`${colors.fgYellow}[${LogLevel.WARN}]${colors.reset} ${message}`);
  }

  static error(message: string, err?: any) {
    console.error(`${colors.fgRed}[${LogLevel.ERROR}]${colors.reset} ${message}`);
    if (err) {
      console.error(err);
    }
  }

  static debug(message: string) {
    if (process.env.DEBUG === "true") {
      console.log(`${colors.fgCyan}[${LogLevel.DEBUG}]${colors.reset} ${message}`);
    }
  }
}
