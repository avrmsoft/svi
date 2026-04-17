import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import FakeLogger from "../../../testUtils/fakeLogger/fakeLogger";
import { fail } from "assert/strict";

describe("Two files Test (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
  });

  it("Generate two files", async () => {
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
# Prompt
Test prompt 2
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

    expect(fakeFs.fileExists("test.js")).toBe(true);
    expect(fakeFs.fileExists("test2.js")).toBe(true);
    expect(fakeLogger.containsLog("Number of found .svi files: 2")).toBe(true);
    expect(fakeLogger.containsLog("Number of processed .svi files: 2")).toBe(
      true,
    );

    if (
      !fakeLogger.containsLog("- Created: C:\\temp\\test.js") &&
      !fakeLogger.containsLog("- Created: /temp/test.js")
    ) {
      fail(
        "Log should contain information about created file test.js with correct path",
      );
    }

    if (
      !fakeLogger.containsLog("- Created: C:\\temp\\test2.js") &&
      !fakeLogger.containsLog("- Created: /temp/test2.js")
    ) {
      fail(
        "Log should contain information about created file test2.js with correct path",
      );
    }
  });
});
