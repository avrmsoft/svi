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
import FakeLogger from "../../../testUtils/fakeLogger";

describe("A duplicate section test (E2E)", () => {
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

  it("A duplicate section test", async () => {
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
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Dependencies
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

    expect(fakeFs.fileExists("test.js")).toBe(false);
    checkProcessExitCalledWith(1);

    expect(
      fakeLogger.containsErrorLog("Duplicate section 'Dependencies'"),
    ).toBe(true);

    expect(
      fakeLogger.containsErrorLog(
        "If you want to include a markdown syntax inside one of the *.svi file sections",
      ),
    ).toBe(true);
  });
});
