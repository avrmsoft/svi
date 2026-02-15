import { vi } from "vitest";
import EnhancedFakeLogChecker from "./enhancedFakeLogChecker";

//Please fake implementation for console.log, console.error, console.warn, console.debug, console.trace
export default class FakeLogger {
  private logSpy: any;
  private logLines: string[] = [];
  private errorLines: string[] = [];
  private warnLines: string[] = [];
  private debugLines: string[] = [];
  private traceLines: string[] = [];
  private allLines: string[] = [];
  private suppressOutputDuringTest: boolean = true;
  private llmLines: string[] = [];

  constructor(suppressOutputDuringTestIn: boolean = true) {
    this.suppressOutputDuringTest = suppressOutputDuringTestIn;
  }

  public applyMocks() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalDebug = console.debug;
    const originalTrace = console.trace;

    this.logSpy = {
      log: vi.spyOn(console, "log").mockImplementation((...args: any[]) => {
        const line = args.join(" ");
        this.logLines.push(line);
        this.allLines.push(line);
        if (!this.suppressOutputDuringTest) {
          originalLog(...args);
        }
      }),
      error: vi.spyOn(console, "error").mockImplementation((...args: any[]) => {
        const line = args.join(" ");
        this.errorLines.push(line);
        this.allLines.push(line);
        if (!this.suppressOutputDuringTest) {
        }
        originalError(...args);
      }),
      warn: vi.spyOn(console, "warn").mockImplementation((...args: any[]) => {
        const line = args.join(" ");
        this.warnLines.push(line);
        this.allLines.push(line);
        if (!this.suppressOutputDuringTest) {
          originalWarn(...args);
        }
      }),
      debug: vi.spyOn(console, "debug").mockImplementation((...args: any[]) => {
        const line = args.join(" ");
        this.debugLines.push(line);
        this.allLines.push(line);
        if (!this.suppressOutputDuringTest) {
          originalDebug(...args);
        }
      }),
      trace: vi.spyOn(console, "trace").mockImplementation((...args: any[]) => {
        const line = args.join(" ");
        this.traceLines.push(line);
        this.allLines.push(line);
        if (!this.suppressOutputDuringTest) {
          originalTrace(...args);
        }
      }),
    };
  }
  public disableMocks() {
    if (this.logSpy) {
      this.logSpy.log.mockRestore();
      this.logSpy.error.mockRestore();
      this.logSpy.warn.mockRestore();
      this.logSpy.debug.mockRestore();
      this.logSpy.trace.mockRestore();
    }
  }

  public hasErrors(): boolean {
    return this.errorLines.length > 0;
  }

  public getLogLines(): string[] {
    return this.logLines;
  }

  public getErrorLines(): string[] {
    return this.errorLines;
  }

  public getWarnLines(): string[] {
    return this.warnLines;
  }

  public getDebugLines(): string[] {
    return this.debugLines;
  }

  public getTraceLines(): string[] {
    return this.traceLines;
  }

  public getAllLines(): string[] {
    return this.allLines;
  }

  public contain(text: string): boolean {
    return this.allLines.some((line) => line.includes(text));
  }

  public containsLog(text: string): boolean {
    return this.logLines.some((line) => line.includes(text));
  }

  public containsLogRegex(pattern: RegExp): boolean {
    return this.logLines.some((line) => pattern.test(line));
  }

  public containsErrorLog(text: string): boolean {
    return this.errorLines.some((line) => line.includes(text));
  }

  public containsErrorLogRegex(pattern: RegExp): boolean {
    return this.errorLines.some((line) => pattern.test(line));
  }

  public containsWarningLog(text: string): boolean {
    return this.warnLines.some((line) => line.includes(text));
  }

  public containsWarningLogRegex(pattern: RegExp): boolean {
    return this.warnLines.some((line) => pattern.test(line));
  }

  public containsDebugLog(text: string): boolean {
    return this.debugLines.some((line) => line.includes(text));
  }

  public containsDebugLogRegex(pattern: RegExp): boolean {
    return this.debugLines.some((line) => pattern.test(line));
  }

  public containsTraceLog(text: string): boolean {
    return this.traceLines.some((line) => line.includes(text));
  }

  public containsTraceLogRegex(pattern: RegExp): boolean {
    return this.traceLines.some((line) => pattern.test(line));
  }

  public setSuppressOutputDuringTest(suppress: boolean) {
    this.suppressOutputDuringTest = suppress;
  }

  public enhancedCheckerForLog(): EnhancedFakeLogChecker {
    return new EnhancedFakeLogChecker(this.allLines);
  }

  public enhancedCheckerForErrorLog(): EnhancedFakeLogChecker {
    return new EnhancedFakeLogChecker(this.errorLines);
  }

  public enhancedCheckerForDebugLog(): EnhancedFakeLogChecker {
    return new EnhancedFakeLogChecker(this.debugLines);
  }

  public enhancedCheckerForWarnLog(): EnhancedFakeLogChecker {
    return new EnhancedFakeLogChecker(this.warnLines);
  }

  public enhancedCheckerForTraceLog(): EnhancedFakeLogChecker {
    return new EnhancedFakeLogChecker(this.traceLines);
  }
}
