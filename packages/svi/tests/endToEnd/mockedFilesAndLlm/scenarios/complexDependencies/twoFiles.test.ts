import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";

describe("Two files Test (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Generate two files, the first depends on the result of the second", async () => {
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
      "test.svi",
      `
# Destination File
test.js
# Dependencies
test2.js
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

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("Test prompt");
    expect(content).toContain("Please return only the code");
    expect(content).toContain("without any explanations");
    expect(content).toContain("installation manual");
    expect(content).toContain(
      "The code should fulfill the following requirements",
    );

    const content2 = fakeFs.fileContent("test2.js");

    expect(content2).toContain("Test prompt 2");
    expect(content2).toContain("Please return only the code");
    expect(content2).toContain("without any explanations");
    expect(content2).toContain("installation manual");
    expect(content2).toContain(
      "The code should fulfill the following requirements",
    );
  });
});
