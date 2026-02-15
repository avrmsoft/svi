import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";
import FakeLogger from "../../../../testUtils/fakeLogger/fakeLogger";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../../../testUtils/fakeProcess";

describe("Destination file lines to itself (E2E)", () => {
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
    restoreProcessExit();
    afterEachSimpleTest(fakeFs, fakeLogger);
  });

  it("Check that the target file is not generated when destination file is self-referencing, and that error message is raised", async () => {
    fakeFs.addFile(
      "svi.json",
      `
      {
        "programmingLanguage": "node.js",
        "searchPaths": [
          "**/*"
        ],
        "ignorePaths": []
      }`,
    );

    fakeFs.addFile(
      "folder\\test.svi",
      `
# Destination File
test.svi
# Dependencies
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
    ]);

    checkProcessExitCalledWith(1);

    const sviFileAfterRun = fakeFs.fileContent("folder\\test.svi");
    expect(sviFileAfterRun)
      .contains("# Destination File")
      .and.contains("test.svi")
      .and.contains("# Dependencies")
      .and.contains("# Output")
      .and.contains("# Options")
      .and.contains("Active=True")
      .and.contains("ProgrammingLanguage=node.js")
      .and.contains("# Import prompts")
      .and.contains("# Prompt")
      .and.contains("Test prompt");

    fakeLogger.containsErrorLogRegex(
      /Error in file.*test\.svi: The destination file cannot be the same as the source file\. Please change the destination file and try again\./,
    );
  });
});
