import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";

describe("Test when svi.json is in a different folder and current folder is out of project structure (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Run for one file", async () => {
    fakeFs.setCwd("C:\\project\\subfolder");

    fakeFs.addFile(
      "C:\\project\\svi.json",
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
      "C:\\project\\subfolder\\specific.svi",
      `
# Destination File
specific.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt specific file
`,
    );

    fakeFs.addFile(
      "C:\\project\\subfolder\\another.svi",
      `
# Destination File
another.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt another file
`,
    );

    fakeFs.applyMocks();

    //fakeFs.setCwd("C:\\project\\subfolder");

    await runCli([
      "node",
      "svi",
      "run",
      "C:\\project\\subfolder\\specific.svi",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
      "-l",
      "DEBUG",
    ]);

    expect(fakeFs.fileExists("C:\\project\\subfolder\\specific.svi")).toBe(
      true,
    );

    const content = fakeFs.fileContent("C:\\project\\subfolder\\specific.js");

    expect(content).toContain("Test prompt specific file");

    expect(fakeFs.fileExists("C:\\project\\subfolder\\another.js")).toBe(false);
  });
});
