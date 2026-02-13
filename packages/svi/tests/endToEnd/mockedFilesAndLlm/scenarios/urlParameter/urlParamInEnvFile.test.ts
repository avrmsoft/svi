import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../../templates/simpleTest";

describe("Test with LLM base url parameter set in .env file (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(
      fakeFs,
      undefined,
      "testKey",
      "gemini-2.5-flash",
      "google",
      "http://fake-llm-base-url.com",
    );
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Generate one file and use LLM base url parameter", async () => {
    fakeFs.addFile(
      "svi.env",
      `API_KEY=testKey
       MODEL_NAME=gemini-2.5-flash
       SERVICE=google
       LLM_BASE_URL=http://fake-llm-base-url.com`,
    );

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
      "test.svi",
      `
# Destination File
test.js
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

    await runCli(["node", "svi", "run"]);

    expect(fakeFs.fileExists("test.js")).toBe(true);

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("Test prompt");
    expect(content).toContain("Please return only the code");
    expect(content).toContain("without any explanations");
    expect(content).toContain("installation manual");
    expect(content).toContain(
      "The code should fulfill the following requirements",
    );
  });
});
