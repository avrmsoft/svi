import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import FakeLogger from "../../../testUtils/fakeLogger";
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

  it("Debug messages are shown", async () => {
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
      "DEBUG",
    ]);

    //expect(fakeLogger.containsDebugLog("Prompt for*was built")).toBe(true);
    expect(fakeLogger.containsDebugLogRegex(/Prompt for .* was built/)).toBe(
      true,
    );
  });
});
