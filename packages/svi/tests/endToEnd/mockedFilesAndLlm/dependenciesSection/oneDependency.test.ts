import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";

describe("Test with import parameters (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Generate one file", async () => {
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
      "maintest.svi",
      `
# Destination File
maintest.js
# Dependencies
dependency.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Please add 2 + 3 and output result.
Use the add function from dependency.js.
`,
    );

    fakeFs.addFile(
      "dependency.js",
      `
export default class Dummy {
  method1() {
    return "This is a dummy method";
  }
}
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

    expect(content).toContain(
      "Your task is to extract all declarations from the code",
    );
    expect(content).toContain(
      "The extracted information should not be a syntaxically correct code",
    );
  });
});
