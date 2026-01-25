import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";

describe("A case with the 'Import prompts' parameter, two files (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Generate one file considering additional context from the 'Import prompts' parameter", async () => {
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
      "test1.svi",
      `
# Destination File
test1.js
# Input parameters
# Output
# Options
Active=True
# Import prompts
test2.svi
# Prompt
A prompt from test1.
`,
    );

    fakeFs.addFile(
      "test2.svi",
      `# Destination File
test2.js
# Input parameters
# Output
# Options
Active=True
# Import prompts
test1.svi
# Prompt
A prompt from test2.
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

    expect(fakeFs.fileExists("test1.js")).toBe(true);

    const content = fakeFs.fileContent("test1.js");

    expect(content).toContain("A prompt from test1");
    expect(content).toContain("A prompt from test2");

    expect(fakeFs.fileExists("test2.js")).toBe(true);
    const content2 = fakeFs.fileContent("test2.js");
    expect(content2).toContain("A prompt from test2");
    expect(content2).toContain("A prompt from test1");
  });
});
