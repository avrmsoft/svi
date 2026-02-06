import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachEndToEndTest,
  afterEachEndToEndTest,
} from "../../endToEndTestUtils";
import {
  enableFakeMaximalistLLMJsLLM,
  disableFakeMaximalistLLMJsLLM,
} from "../../../testUtils/fakeMaximalistLlmJsObjects/fakeMaximalistLlmJs";
import {
  enableFakeMaximalistLLMJsModelUsage,
  disableFakeMaximalistLLMJsModelUsage,
} from "../../../testUtils/fakeMaximalistLlmJsObjects/fakeMaximalistLlmJsModelUsage";
import FakeLogger from "../../../testUtils/fakeLogger";

describe("A parameter to output prompts in stdout (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    fakeFs = new fakeFileSystem();
    beforeEachEndToEndTest(fakeFs, fakeLogger);

    enableFakeMaximalistLLMJsLLM({
      model: "gemini-2.5-flash",
      apiKey: "testKey",
      service: "google",
    });

    enableFakeMaximalistLLMJsModelUsage();
  });

  afterEach(() => {
    disableFakeMaximalistLLMJsLLM();
    disableFakeMaximalistLLMJsModelUsage();
    afterEachEndToEndTest(fakeFs, fakeLogger);
  });

  it("Check that prompts are shown in stdout when --show-prompts is used", async () => {
    fakeFs.addFile(
      "svi.json",
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
      "folder\\test.svi",
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

    await runCli([
      "node",
      "svi",
      "run",
      "--show-prompts",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    expect(fakeFs.fileExists("folder\\test.js")).toBe(true);

    expect(fakeLogger.containsLog("Please return only the code")).toBe(true);
    expect(fakeLogger.containsLog("without any explanations")).toBe(true);
    expect(fakeLogger.containsLog("installation manual")).toBe(true);
    expect(
      fakeLogger.containsLog(
        "The code should fulfill the following requirements",
      ),
    ).toBe(true);
  });
});
