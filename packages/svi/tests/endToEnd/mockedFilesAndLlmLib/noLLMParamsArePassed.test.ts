import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../testUtils/fakeProcess";
import FakeLogger from "../../testUtils/fakeLogger";

function prepareExample(fakeFs: fakeFileSystem) {
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

  fakeFs.applyMocks();
}

describe("No LLM params are passed (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    fakeLogger.setSuppressOutputDuringTest(false);
    beforeEachEndToEndTest(fakeFs, fakeLogger);

    enableFakeMaximalistLLMJsLLM({
      model: "gemini-2.5-flash",
      apiKey: "testKey",
      service: "google",
    });

    enableFakeMaximalistLLMJsModelUsage();

    mockProcessExit();
  });

  afterEach(() => {
    afterEachEndToEndTest(fakeFs, fakeLogger);
    disableFakeMaximalistLLMJsLLM();
    disableFakeMaximalistLLMJsModelUsage();
    restoreProcessExit();
  });

  it("No parameters at all, the 'Model' error is displayed", async () => {
    prepareExample(fakeFs);

    await runCli(["node", "svi", "run"]);

    checkProcessExitCalledWith(1);

    expect(fakeFs.fileExists("test.js")).toBe(false);
    expect(
      fakeLogger.containsErrorLog("LLM model name is not specified."),
    ).toBe(true);
    expect(
      fakeLogger.containsErrorLog(
        "Please specify the model name in svi.env file in your root directory, or specify another .env file via the -e parameter.",
      ),
    ).toBe(true);
    expect(
      fakeLogger.containsErrorLog(
        "Also, you can specify the model name via the -m parameter.",
      ),
    ).toBe(true);
    expect(fakeLogger.containsErrorLog(".env file example:")).toBe(true);
  });
});
