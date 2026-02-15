import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";
import { prepareForComparison } from "../../testUtils/testUtils";
import FakeLogger from "../../testUtils/fakeLogger/fakeLogger";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../testUtils/fakeProcess";

describe("Test of 'svi init' command (E2E)", () => {
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

  const DEFAULT_SVI_JSON_CONTENT = `{
  "programmingLanguage": "",
  "searchPaths": [
    "**/*"
  ],
  "ignorePaths": []
}`;

  it("Check init command does not overwrite existing file", async () => {
    fakeFs.addFile("svi.json", "Existing content");

    fakeFs.applyMocks();

    await runCli(["node", "svi", "init"]);

    checkProcessExitCalledWith(1);

    expect(fakeFs.fileExists("svi.json")).toBe(true);

    const content = fakeFs.fileContent("svi.json");

    expect(prepareForComparison(content)).not.toContain(
      prepareForComparison(DEFAULT_SVI_JSON_CONTENT),
    );

    expect(content).toContain("Existing content");

    expect(
      fakeLogger.containsErrorLog(
        "File svi.json already exists, the initialization cancelled",
      ),
    ).toBe(true);
  });
});
