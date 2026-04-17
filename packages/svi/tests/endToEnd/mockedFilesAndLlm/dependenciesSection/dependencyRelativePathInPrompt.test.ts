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
          "**/*"
        ],
        "ignorePaths": []
      }`,
    );

    fakeFs.addFile(
      "folder\\maintest.svi",
      `
# Destination File
maintest.js
# Dependencies
subfolder\\dependency.js
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
      "folder\\subfolder\\dependency.js",
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

    expect(fakeFs.fileExists("folder\\maintest.js")).toBe(true);

    const content = fakeFs.fileContent("folder\\maintest.js");
    const normalizedContent = content ? content.replace(/\\/g, "/") : "";

    expect(normalizedContent).toContain("Please add 2 + 3 and output result");

    expect(normalizedContent).toContain(
      "Your task is to extract all declarations from the code",
    );
    expect(normalizedContent).toContain(
      "The extracted information should not be a syntaxically correct code",
    );
    expect(normalizedContent).toContain("export default class Dummy");
    expect(normalizedContent).toContain("folder/subfolder/dependency.js");
  });
});
