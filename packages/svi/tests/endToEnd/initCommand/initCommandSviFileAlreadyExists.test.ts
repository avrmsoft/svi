import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";
import FakeLogger from "../../testUtils/fakeLogger/fakeLogger";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../testUtils/fakeProcess";

describe("Test of 'svi init <file.svi>' command (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
    mockProcessExit();
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
    restoreProcessExit();
  });

  it("Check init command does not overwrite existing file", async () => {
    fakeFs.addFile("test.svi", "Existing content");
    fakeFs.applyMocks();

    await runCli(["node", "svi", "init", "test.svi"]);

    checkProcessExitCalledWith(1);

    expect(fakeFs.fileExists("test.svi")).toBe(true);

    const content = fakeFs.fileContent("test.svi");
    expect(content).toContain("Existing content");
    expect(content).not.toContain("# Destination File");
    expect(content).not.toContain("# Dependencies");
    expect(content).not.toContain("# Output");

    expect(
      fakeLogger.containsErrorLog(
        "File test.svi already exists, the initialization cancelled",
      ),
    ).toBe(true);
  });
});
