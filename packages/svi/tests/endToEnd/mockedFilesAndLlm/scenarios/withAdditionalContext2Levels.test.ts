import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";

describe("A case with additional context (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Generate one file considering additional context", async () => {
    fakeFs.addFile(
      "svi.json",
      `
      {
        "programmingLanguage": "node.js",
        "searchPaths": [
          "*"
        ],
        "ignorePaths": []
      }`
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
`
    );

    fakeFs.addFile(
      "folder\\partDescription.svi",
      `
# Destination File
# Input parameters
# Output
# Options
Active=True
# Import prompts
../projectDescription.svi
# Prompt
The project part's description is as follows:
This module is responsible for computing.
`
    );

    fakeFs.addFile(
      "folder\\subfolder\\test.svi",
      `
# Destination File
test.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
../partDescription.svi
# Prompt
Please write a function add(a, b) that returns the sum of a and b.
`
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

    expect(fakeFs.fileExists("folder\\subfolder\\test.js")).toBe(true);

    const content = fakeFs.fileContent("folder\\subfolder\\test.js");

    expect(content).toContain(
      "Please write a function add(a, b) that returns the sum of a and b"
    );
    expect(content).toContain("This module is responsible for computing");
    expect(content).toContain(
      "We are building a simple application that can add numbers"
    );

    expect(fakeFs.fileExists("folder\\partDescription.js")).toBe(false);
  });
});
