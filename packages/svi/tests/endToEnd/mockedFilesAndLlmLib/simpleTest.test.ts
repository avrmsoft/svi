import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachEndToEndTest,
  afterEachEndToEndTest,
} from "../endToEndTestUtils";
import {
  enableFakeMaximalistLLMJsLLM,
  disableFakeMaximalistLLMJsLLM,
} from "../../testUtils/fakeMaximalistLlmJsObjects/fakeMaximalistLlmJs";
import {
  enableFakeMaximalistLLMJsModelUsage,
  disableFakeMaximalistLLMJsModelUsage,
} from "../../testUtils/fakeMaximalistLlmJsObjects/fakeMaximalistLlmJsModelUsage";

describe("Simple Test (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachEndToEndTest(fakeFs);

    enableFakeMaximalistLLMJsLLM({
      model: "gemini-2.5-flash",
      apiKey: "testKey",
      service: "google",
    });

    enableFakeMaximalistLLMJsModelUsage();
  });

  afterEach(() => {
    afterEachEndToEndTest(fakeFs);
    disableFakeMaximalistLLMJsLLM();
    disableFakeMaximalistLLMJsModelUsage();
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
      }`
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

    expect(fakeFs.fileExists("test.js")).toBe(true);

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("Test prompt");
    expect(content).toContain("Please return only the code");
    expect(content).toContain("without any explanations");
    expect(content).toContain("installation manual");
    expect(content).toContain(
      "The code should fulfill the following requirements"
    );
  });
});
