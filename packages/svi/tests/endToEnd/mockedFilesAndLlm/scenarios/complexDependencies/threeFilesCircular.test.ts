import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";

describe("Three files Circular Test + other file (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Generate three files with the dependency first -> second -> third -> first + other file", async () => {
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
test_other.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt 1
`,
    );

    fakeFs.addFile(
      "test2.svi",
      `
# Destination File
test2.js
# Dependencies
test3.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt 2
`,
    );

    fakeFs.addFile(
      "test3.svi",
      `
# Destination File
test3.js
# Dependencies
test.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt 3
`,
    );

    fakeFs.addFile(
      "test_other.svi",
      `
# Destination File
test_other.js
# Dependencies
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt Other
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

    expect(content).toContain("Test prompt 1");

    expect(content).toContain(
      "Your task is to extract all declarations from the code",
    );
    expect(content).toContain(
      "The extracted information should not be a syntaxically correct code",
    );

    expect(content).toContain("Test prompt 2");
    expect(content).toContain("Test prompt Other");

    const content2 = fakeFs.fileContent("test2.js");

    expect(content2).toContain("Test prompt 2");
    expect(content2).toContain("Please return only the code");
    expect(content2).toContain("without any explanations");
    expect(content2).toContain("installation manual");
    expect(content2).toContain(
      "The code should fulfill the following requirements",
    );

    expect(content2).toContain(
      "Your task is to extract all declarations from the code",
    );
    expect(content2).toContain(
      "The extracted information should not be a syntaxically correct code",
    );

    expect(content2).toContain("Test prompt 3");

    const content3 = fakeFs.fileContent("test3.js");

    expect(content3).toContain("Test prompt 3");
    expect(content3).toContain("Please return only the code");
    expect(content3).toContain("without any explanations");
    expect(content3).toContain("installation manual");
    expect(content3).toContain(
      "The code should fulfill the following requirements",
    );

    expect(content3).toContain(
      "Your task is to extract all declarations from the code",
    );
    expect(content3).toContain(
      "The extracted information should not be a syntaxically correct code",
    );

    expect(content3).toContain("Test prompt 1");
  });
});
