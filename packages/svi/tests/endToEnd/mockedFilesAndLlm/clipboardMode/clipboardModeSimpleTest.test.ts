import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";

describe("A config file with parameters 'searchPaths' (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(
      fakeFs,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("A test with parameter 'searchPaths'", async () => {
    fakeFs.addFile(
      `svi.json`,
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
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Test prompt
`,
    );

    fakeFs.applyMocks();

    //enableFakeLLMProcessor({ apiKey: "testKey" });

    await runCli(["node", "svi", "run", "-c"]);

    expect(fakeFs.fileExists("test.js")).toBe(true);

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("Test prompt");
    expect(content).toContain("Please return only the code");
    expect(content).toContain("without any explanations");
    expect(content).toContain("installation manual");
    expect(content).toContain(
      "The code should fulfill the following requirements",
    );
    expect(content).toContain(
      "Fake ManualLlmExecutor answer for system prompt",
    );
  });
});
