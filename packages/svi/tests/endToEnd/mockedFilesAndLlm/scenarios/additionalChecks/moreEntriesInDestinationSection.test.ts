import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../../../testUtils/fakeProcess";
import FakeLogger from "../../../../testUtils/fakeLogger/fakeLogger";

describe("More than one item in the # Destination section (E2E)", () => {
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

  it("If there is more than one item in the # Destination section, an error should be raised", async () => {
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
item_that_should_not_be_here.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test
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

    expect(fakeFs.fileExists("test.js")).toBe(false);

    expect(
      fakeLogger.containsErrorLog(
        "More than one item in the # Destination section",
      ),
    ).toBe(true);
  });
});
