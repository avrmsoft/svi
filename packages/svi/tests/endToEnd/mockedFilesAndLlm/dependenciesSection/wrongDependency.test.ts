import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import FakeLogger from "../../../testUtils/fakeLogger/fakeLogger";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../../testUtils/fakeProcess";
import { fail } from "assert/strict";

describe("Dependency not found in 'Dependencies' section (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
    mockProcessExit();

    fakeFs.addFile(
      "svi.json",
      `
      {
        "programmingLanguage": "node.js",
        "searchPaths": [
          "*"
        ],
        "ignorePaths": []
      }`,
    );

    // mainFile.svi declares a dependency that does not exist
    fakeFs.addFile(
      "mainFile.svi",
      `
# Destination File
output.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Dependencies
wrongDependency.js
# Prompt
This is a test prompt that should not be processed due to the missing dependency.
`,
    );

    // Crucially, wrongDependency.js is NOT added to fakeFs, simulating its absence.

    fakeFs.applyMocks();
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
    restoreProcessExit();
  });

  it("should log an error for a missing dependency and exit with code 1", async () => {
    await runCli([
      "node",
      "svi",
      "run",
      "mainFile.svi", // Specify the svi file to run
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    // 1. Error log is not empty
    expect(fakeLogger.hasErrors()).toBe(true);

    // 2. Process exit code = 1
    checkProcessExitCalledWith(1);

    // 3. The specified phrase should exist in the error log
    expect(
      fakeLogger.containsErrorLog("from 'Dependencies' section not found"),
    ).toBe(true);

    if (
      !fakeLogger.containsErrorLog("C:\\temp\\wrongDependency.js") &&
      !fakeLogger.containsErrorLog("/temp/wrongDependency.js")
    ) {
      fail(
        "Log should contain information about missing dependency with correct path",
      );
    }
  });
});
