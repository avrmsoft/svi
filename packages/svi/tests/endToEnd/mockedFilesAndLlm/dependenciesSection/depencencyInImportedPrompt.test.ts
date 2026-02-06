import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import FakeLogger from "../../../testUtils/fakeLogger";
import {
  mockProcessExit,
  restoreProcessExit,
} from "../../../testUtils/fakeProcess";

describe("Dependencies Section E2E", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger(false); // Do not suppress output
    beforeEachSimpleTest(fakeFs, fakeLogger);
    mockProcessExit();
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
    restoreProcessExit();
  });

  it("should include dependency content from imported prompt in the target file", async () => {
    // Setup svi.json for the project
    fakeFs.addFile(
      "svi.json",
      `
      {
        "programmingLanguage": "typescript",
        "searchPaths": [
          "**/*"
        ],
        "ignorePaths": []
      }`
    );

    // Setup the dependency file
    fakeFs.addFile(
      "dependency.js",
      `console.log("This is content from dependency.js");`
    );

    // Setup the imported.svi file, which has a dependency
    fakeFs.addFile(
      "imported.svi",
      `
# Dependencies
dependency.js
# Prompt
Your task is to extract all declarations from the code
This is additional content from imported.svi.
`
    );

    // Setup the mainFile.svi, which imports imported.svi and has a destination file
    fakeFs.addFile(
      "folder/mainFile.svi",
      `
# Destination File
mainfile.js
# Import prompts
../imported.svi
# Prompt
This is content from mainFile.svi.
`
    );

    fakeFs.applyMocks();

    // Run the CLI
    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    // Define the expected path of the generated file
    const targetFilePath = "folder/mainfile.js";

    // Assert that the target file was created
    expect(fakeFs.fileExists(targetFilePath)).toBe(true);

    const generatedContent = fakeFs.fileContent(targetFilePath);
    expect(generatedContent).toBeDefined();

    // Assert that content from dependency.js is present
    expect(generatedContent).toContain(`console.log("This is content from dependency.js");`);

    // Assert that the specific phrase from imported.svi is present
    expect(generatedContent).toContain("Your task is to extract all declarations from the code");

    // Assert that other content from imported.svi is present
    expect(generatedContent).toContain("This is additional content from imported.svi.");

    // Assert that content from mainFile.svi is present
    expect(generatedContent).toContain("This is content from mainFile.svi.");

    // As per guidelines, no process.exit(0) check is needed for successful execution.
  });
});