import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";

describe("Test with one specific (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Run for one file", async () => {
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
      "specific.svi",
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
      "another.svi",
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

    await runCli([
      "node",
      "svi",
      "run",
      "specific.svi",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    expect(fakeFs.fileExists("specific.js")).toBe(true);

    const content = fakeFs.fileContent("specific.js");

    expect(content).toContain("Test prompt specific file");

    expect(fakeFs.fileExists("another.js")).toBe(false);
  });
});
