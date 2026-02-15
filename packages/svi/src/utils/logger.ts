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
  private static showPrompts: boolean = false;
  private static errorMessages: string[] = [];

  static setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  static setShowPrompts(show: boolean) {
    this.showPrompts = show;
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
      `${colors.fgGreen}[${LogLevel.SUCCESS}]${colors.reset} ${message}`,
    );
  }

  static warn(message: string) {
    if (this.logLevel === LogLevel.ERROR) {
      return;
    }
    console.warn(
      `${colors.fgYellow}[${LogLevel.WARN}]${colors.reset} ${message}`,
    );
  }

  static warning(message: string) {
    this.warn(message);
  }

  static error(message: string, err?: any) {
    console.error(
      `${colors.fgRed}[${LogLevel.ERROR}]${colors.reset} ${message}`,
    );
    if (err) {
      console.error(err);
    }
    this.errorMessages.push(message + (err ? ": " + err.toString() : ""));
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
    //if (process.env.DEBUG === "true") {
    console.debug(
      `${colors.fgCyan}[${LogLevel.DEBUG}]${colors.reset} ${message}`,
    );
    //}
  }

  static trace(message: string) {
    if (this.logLevel !== LogLevel.TRACE) {
      return;
    }
    //if (process.env.DEBUG === "true") {
    console.log(
      `${colors.fgCyan}[${LogLevel.TRACE}]${colors.reset} ${message}`,
    );
    //}
  }

  static prompt(message: string) {
    if (this.showPrompts) {
      this.info(
        `${colors.fgCyan}[PROMPT]${colors.reset}\n===================\n${message}\n===================\n`,
      );
    } else {
      this.debug(
        `LLM prompt, length ${message.length}: ${message.substring(0, 100)}...`,
      );
    }
  }

  static llmResponse(message: string) {
    if (this.showPrompts) {
      this.info(
        `${colors.fgCyan}[LLM RESPONSE]${colors.reset}\n===================\n${message}\n===================`,
      );
    } else {
      this.trace(
        `LLM response, length ${message.length}: ${message.substring(0, 100)}...`,
      );
    }
  }

  static repeatErrorMessages() {
    if (this.errorMessages.length > 0) {
      console.error(
        `${colors.fgRed}[${LogLevel.ERROR}]${colors.reset} Summary of error messages:`,
      );
      for (const msg of this.errorMessages) {
        console.error(`- ${msg}`);
      }
    }
  }
}
