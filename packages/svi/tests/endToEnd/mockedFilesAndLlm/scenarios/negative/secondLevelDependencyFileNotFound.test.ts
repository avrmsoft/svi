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

describe("Dependency File Not Found (E2E)", () => {
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

  it("Check that the target file is not generated when dependency file is not found, and that error message is raised", async () => {
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
      "folder\\section\\test.svi",
      `
# Destination File
test.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
../sectionDescription.svi
# Prompt
Test prompt
`,
    );

    fakeFs.addFile(
      "folder\\sectionDescription.svi",
      `
# Import prompts
../projectDescription.svi
# Prompt
Test prompt`,
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

    expect(fakeFs.fileExists("folder\\test.js")).toBe(false);

    expect(
      fakeLogger.containsErrorLog(
        "Failed to load imported prompt from dependency",
      ),
    ).toBe(true);

    expect(fakeLogger.containsErrorLog("projectDescription.svi")).toBe(true);
    expect(
      fakeLogger.containsErrorLog(
        "Error(s) occured during processing, not all operations were successful",
      ),
    ).toBe(true);
  });
});
