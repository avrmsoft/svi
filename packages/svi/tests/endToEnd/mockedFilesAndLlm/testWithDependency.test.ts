import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../testUtils/fakeLLM";

describe("Test with a dependency (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
  });

  afterEach(() => {
    disableFakeLLMProcessor();
    fakeFs.restoreMocks();
    vi.clearAllMocks();
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
      "maintest.svi",
      `
# Destination File
maintest.js
# Input parameters
function add from dependency.js
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Please add 2 + 3 and output result.
Use the add function from dependency.js.
`
    );

    fakeFs.addFile(
      "dependency.svi",
      `
# Destination File
dependency.js
# Input parameters
# Output
export function add(a, b)
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
Please create a function to add two numbers (a and b) and return the result.
`
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

    expect(fakeFs.fileExists("maintest.js")).toBe(true);

    const content = fakeFs.fileContent("maintest.js");

    expect(content).toContain("Please add 2 + 3 and output result");

    expect(fakeFs.fileExists("dependency.js")).toBe(true);

    const depContent = fakeFs.fileContent("dependency.js");

    expect(depContent).toContain("export function add(a, b)");
    expect(depContent).toContain(
      "Please create a function to add two numbers (a and b) and return the result"
    );
  });
});
