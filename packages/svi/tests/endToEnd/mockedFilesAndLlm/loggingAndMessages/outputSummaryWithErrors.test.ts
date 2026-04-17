import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../../testUtils/fakeProcess";
import FakeLogger from "../../../testUtils/fakeLogger/fakeLogger";
import { fail } from "assert/strict";

describe("Output summary containing error messages (E2E)", () => {
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

  it("Two files successful, one file failed", async () => {
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

    fakeFs.addFile(
      "test.svi",
      `
# Destination File
test.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt
`,
    );

    fakeFs.addFile(
      "test2.svi",
      `
# Destination File
test2.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
not_existing.svi
# Prompt
Test prompt 2
`,
    );

    fakeFs.addFile(
      "test3.svi",
      `
# Destination File
test3.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt 3
`,
    );

    fakeFs.addFile(
      "test3.js",
      `
      console.log("This is the old content of test3.js");`,
    );

    fakeFs.applyMocks();

    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    checkProcessExitCalledWith(1);

    expect(fakeFs.fileExists("test.js")).toBe(true);
    expect(fakeFs.fileExists("test3.js")).toBe(true);
    expect(fakeLogger.containsLog("Number of found .svi files: 3")).toBe(true);
    expect(fakeLogger.containsLog("Number of processed .svi files: 2")).toBe(
      true,
    );
    expect(
      fakeLogger.containsWarningLog(
        "Number of .svi files that failed to process: 1",
      ),
    ).toBe(true);

    if (
      !fakeLogger.containsLog("- Created: C:\\temp\\test.js") &&
      !fakeLogger.containsLog("- Created: /temp/test.js")
    ) {
      fail(
        "Log should contain information about created file test.js with correct path",
      );
    }

    if (
      !fakeLogger.containsLog("- Updated: C:\\temp\\test3.js") &&
      !fakeLogger.containsLog("- Updated: /temp/test3.js")
    ) {
      fail(
        "Log should contain information about updated file test3.js with correct path",
      );
    }

    expect(
      fakeLogger.containsWarningLogRegex(
        /- Failed: (C:)?[\\/]+temp[\\/]+test2\.svi/,
      ),
    ).toBe(true);

    expect(() =>
      fakeLogger
        .enhancedCheckerForLog()
        .contains("RunManager: Some files failed to process.")
        .and()
        .previousNLines(3)
        .contains("Error creating prompt for file"),
    ).not.toThrow();
  });
});
