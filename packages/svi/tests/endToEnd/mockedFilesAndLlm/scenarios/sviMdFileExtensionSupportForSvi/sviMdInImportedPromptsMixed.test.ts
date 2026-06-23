import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";

describe("Test of support of svi.md file extension (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Support of svi.md file extension, simple test", async () => {
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
      "maintest.svi",
      `
# Destination File
maintest.js
# Dependencies
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
subfolder/main
# Prompt
Please add 2 + 3 and output result.
`,
    );

    fakeFs.addFile(
      "subfolder/main.svi.md",
      `
# Destination File
# Dependencies
# Output
# Options
Active=True
ProgrammingLanguage=
# Import prompts
main2.svi
# Prompt
A prompt from subfolder
`,
    );

    fakeFs.addFile(
      "subfolder/main2.svi",
      `
# Destination File
# Dependencies
# Output
# Options
Active=True
ProgrammingLanguage=
# Import prompts
# Prompt
A prompt from subfolder, main 2
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

    expect(fakeFs.fileExists("maintest.js")).toBe(true);

    const content = fakeFs.fileContent("maintest.js");

    expect(content).toContain("Please add 2 + 3 and output result");

    expect(content).toContain("A prompt from subfolder");
    expect(content).toContain("A prompt from subfolder, main 2");
  });
});
