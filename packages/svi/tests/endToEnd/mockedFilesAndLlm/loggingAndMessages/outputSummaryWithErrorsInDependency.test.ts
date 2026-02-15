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

describe("Output summary containing error messages when error in Dependency section (E2E)", () => {
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

  it("One file failed because of an issue in Dependency section", async () => {
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
# Dependencies
notExistingFile.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt
`,
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
      "-l",
      "TRACE",
      "-P",
    ]);

    checkProcessExitCalledWith(1);

    expect(fakeLogger.containsLog("Number of found .svi files: 1")).toBe(true);
    expect(fakeLogger.containsLog("Number of processed .svi files: 0")).toBe(
      true,
    );
    expect(
      fakeLogger.containsWarningLog(
        "Number of .svi files that failed to process: 1",
      ),
    ).toBe(true);

    expect(
      fakeLogger.containsWarningLogRegex(
        /- Failed: (C:)?[\\/]+temp[\\/]+test\.svi/,
      ),
    ).toBe(true);
  });
});
