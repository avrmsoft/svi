import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";
import FakeLogger from "../../../../testUtils/fakeLogger";

describe("A case with the 'Import prompts' parameter from not *.svi file (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
  });

  it("Generate one file considering additional context from imported prompts from not *.svi file", async () => {
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
      "someCode.js",
      `
export interface TestInterface {
  field1: string;
  field2: number;

  someMethod(): string;
}
`,
    );

    fakeFs.addFile(
      "test.svi",
      `
# Destination File
test.js
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
someCode.js
# Prompt
Please write an implementation class for the given interface.
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

    expect(content).toContain(
      "Please write an implementation class for the given interface",
    );
    expect(content).toContain("export interface TestInterface");

    expect(fakeLogger.hasErrors()).toBe(false);
  });
});
