import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import FakeLogger from "../../../testUtils/fakeLogger/fakeLogger";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
  prepareSimpleTest,
} from "../../templates/simpleTest";
import { runCli } from "../../../../src/commands/entryPoint";

describe("Test logger output in debug mode", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
  });

  it("Info messages are shown", async () => {
    prepareSimpleTest(fakeFs);

    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
      "-l",
      "INFO",
    ]);

    //expect(fakeLogger.containsDebugLog("Prompt for*was built")).toBe(true);
    expect(fakeLogger.containsLog("Ask LLM for")).toBe(true);
  });

  it("Debug messages are not shown", async () => {
    prepareSimpleTest(fakeFs);

    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
      "-l",
      "INFO",
    ]);

    //expect(fakeLogger.containsDebugLog("Prompt for*was built")).toBe(true);
    expect(fakeLogger.containsDebugLogRegex(/Prompt for .* was built/)).toBe(
      false,
    );
  });
});
