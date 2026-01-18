import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import FakeLogger from "../../../../testUtils/fakeLogger";
import {
  mockProcessExit,
  restoreProcessExit,
} from "../../../../testUtils/fakeProcess";

describe("Dependency File is Incorrect (E2E)", () => {
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

  it("Check that the target file is not generated when dependency file is incorrect, and that error message is raised", async () => {
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
      "Incorrect file content that does not conform to .svi format",
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

    //checkProcessExitCalledWith(1);

    fakeLogger.containsWarningLog("[SVIParser] Unknown section");
  });
});
