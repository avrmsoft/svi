import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";

describe("A case with the 'Import prompts' parameter and project root based paths (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("A case with the 'Import prompts' parameter and project root based paths", async () => {
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
      "projectDescription.svi",
      `
# Destination File
# Input parameters
# Output
# Options
Active=True
# Import prompts
# Prompt
The main project description is as follows:
We are building a simple application that can add numbers.
`,
    );

    fakeFs.addFile(
      "folder\\test.svi",
      `
# Destination File
test.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
@project_root/projectDescription.svi
# Prompt
Please write a function add(a, b) that returns the sum of a and b.
`,
    );

    fakeFs.addFile(
      "folder\\subfolder\\test2.svi",
      `
# Destination File
test2.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
@project_root/folder/test.svi
# Prompt
A prompt in sub-folder
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

    expect(fakeFs.fileExists("folder\\test.js")).toBe(true);

    const content = fakeFs.fileContent("folder\\test.js");

    expect(content).toContain(
      "Please write a function add(a, b) that returns the sum of a and b",
    );
    expect(content).toContain(
      "We are building a simple application that can add numbers",
    );

    expect(fakeFs.fileExists("projectDescription.js")).toBe(false);

    expect(fakeFs.fileExists("folder\\subfolder\\test2.js")).toBe(true);

    const content2 = fakeFs.fileContent("folder\\subfolder\\test2.js");

    expect(content2).toContain("A prompt in sub-folder");
    expect(content2).toContain(
      "Please write a function add(a, b) that returns the sum of a and b",
    );
    expect(content2).toContain(
      "We are building a simple application that can add numbers",
    );
  });
});
