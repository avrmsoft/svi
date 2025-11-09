import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../testUtils/fakeLLM";

describe("Simple Test (E2E)", () => {
  it("Generate one file", async () => {
    const fakeFs = new fakeFileSystem();

    if (process.platform === "win32") {
      fakeFs.setCwd("C:\\temp");
    } else {
      fakeFs.setCwd("/tmp");
    }

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

    enableFakeLLMProcessor();

    await runCli(["node", "svi", "run", "-m", "gemini-2.5-flash", "-k", "ddd"]);

    expect(fakeFs.fileExists("test.js")).toBe(true);

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("Test prompt");
    expect(content).toContain("Please return only the code");
    expect(content).toContain("without any explanations");
    expect(content).toContain("installation manual");
    expect(content).toContain(
      "The code should fulfill the following requirements"
    );

    disableFakeLLMProcessor();
    fakeFs.restoreMocks();
  });
});
