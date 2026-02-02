import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";
import FakeLogger from "../../../testUtils/fakeLogger";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../../testUtils/fakeProcess";

describe("Dependencies section: handling of non-existent dependency", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
    mockProcessExit();
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
    restoreProcessExit();
  });

  it("should log an error and exit with code 1 when a dependency is not found", async () => {
    // Setup the main svi.json configuration file
    fakeFs.addFile(
      "svi.json",
      `
      {
        "programmingLanguage": "node.js",
        "searchPaths": [
          "*"
        ],
        "ignorePaths": []
      }`
    );

    // Setup mainFile.svi with a dependency that does not exist on the file system
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
# Import prompts
# Prompt
This content should not be generated if dependencies are missing.
`
    );

    // Do NOT add 'wrongDependency.js' to fakeFs, simulating its absence.

    // Apply the mocked file system to the environment
    fakeFs.applyMocks();

    // Run the CLI command
    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash", // The model doesn't matter here as LLM operations are mocked
      "-k",
      "testKey",          // The API key doesn't matter here
    ]);

    // 1. Check if the error log is not empty
    expect(fakeLogger.hasErrors()).toBe(true);
    expect(fakeLogger.getErrorLines().length).toBeGreaterThan(0);

    // 2. Check if the process exited with code 1
    checkProcessExitCalledWith(1);

    // 3. Check for the specific phrase in the error log
    expect(
      fakeLogger.containsErrorLogRegex(
        /from 'Dependencies' section not found\. It was attempted to be found at/
      )
    ).toBe(true);

    // Verify that the destination file was not created due to the error
    expect(fakeFs.fileExists("output.js")).toBe(false);
  });
});