import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../../../testUtils/fakeLLM";

describe("Code cleaning when not only (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeFs.applyMocks();
    //beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    fakeFs.restoreMocks();
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

    enableFakeLLMProcessor(
      undefined,
      `Some reasoning before
That should be cleared out
\`\`\`typescript
function test() {\n  return 'Hello World';\n}
\`\`\`
Some reasoning after
That should be cleared out as well`,
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

    disableFakeLLMProcessor();

    expect(fakeFs.fileExists("test.js")).toBe(true);

    const content = fakeFs.fileContent("test.js");

    expect(content).toContain("function test()");
    expect(content).toContain("Hello World");
    expect(content).not.toContain("Some reasoning before");
    expect(content).not.toContain("Some reasoning after");
  });
});
