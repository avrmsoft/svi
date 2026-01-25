import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import FakeLogger from "../../../../testUtils/fakeLogger";
import {
  mockProcessExit,
  checkProcessExitNotCalled,
  restoreProcessExit,
} from "../../../../testUtils/fakeProcess";

describe("A case with the 'Import prompts' parameter from not *.svi file containing a valid SVI part that should be ignored (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    beforeEachSimpleTest(fakeFs, fakeLogger);
    mockProcessExit();
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
    restoreProcessExit();
  });

  it("A non-svi file contains a piece of a correct SVI file. The process should ignore it", async () => {
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
  export function writeSviHelp() {
    console.log(\'
An example of the SVI format:
=====================================
# Destination File
test.js
# Input parameters
Import function1(param1: number) : string from ../utils/utils.js
# Output
export function2(paramA: string) : number
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
../prompts/common.svi
specific.svi
# Prompt
Test prompt
=====================================
        \');
    }`,
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
    expect(content).toContain("An example of the SVI format");
    expect(content).toContain("# Prompt");
    expect(content).toContain(
      "Please write an implementation class for the given interface.",
    );
    expect(fakeLogger.hasErrors()).toBe(false);

    checkProcessExitNotCalled();
  });
});
