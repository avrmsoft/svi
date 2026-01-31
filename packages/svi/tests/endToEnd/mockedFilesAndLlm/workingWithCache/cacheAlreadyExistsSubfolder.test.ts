import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../../testUtils/fakeLLM";

describe("A test when cache already exists (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
  });

  afterEach(() => {
    disableFakeLLMProcessor();
    fakeFs.restoreMocks();
    vi.clearAllMocks();
  });

  it("Check that a new file is not generated when cache already exists", async () => {
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
      "subfolder/test.svi",
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
Test prompt not cached
`,
    );

    fakeFs.addFile(
      "subfolder/test.js",
      "Old content that shouldn't be replaced",
    );
    fakeFs.addFile(
      "subfolder/.svicache",
      `ProcessedSviFilesHash:
  test.svi:
    hash: 929d49c0a006da8dfa4397b2d67caec6c1be76259b98dd349abf1b27bc9bc470`,
    );

    fakeFs.applyMocks();

    enableFakeLLMProcessor({ apiKey: "testKey" });

    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    expect(fakeFs.fileExists("subfolder/test.js")).toBe(true);

    const content = fakeFs.fileContent("subfolder/test.js");

    expect(content).toContain("Old content that shouldn't be replaced");
    expect(content).not.toContain("Test prompt not cached");
  });
});
