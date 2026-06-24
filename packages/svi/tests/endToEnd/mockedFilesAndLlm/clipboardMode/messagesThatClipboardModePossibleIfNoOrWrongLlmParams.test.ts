import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import FakeLogger from "../../../testUtils/fakeLogger/fakeLogger";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import {
  mockProcessExit,
  checkProcessExitCalledWith,
  restoreProcessExit,
} from "../../../testUtils/fakeProcess";

describe("A clipboard mode with -c parameter (E2E)", () => {
  let fakeFs: fakeFileSystem;
  let fakeLogger: FakeLogger;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeLogger = new FakeLogger();
    beforeEachSimpleTest(fakeFs, fakeLogger);
    mockProcessExit();
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs, fakeLogger);
    restoreProcessExit();
  });

  it("No LLM parameters provided", async () => {
    await runTest(fakeFs, fakeLogger, []);
  });

  it("No API key provided", async () => {
    await runTest(fakeFs, fakeLogger, ["-m", "gemini-2.5-flash"]);
  });

  it("No model provided", async () => {
    await runTest(fakeFs, fakeLogger, ["-k", "testKey"]);
  });
});

async function runTest(
  fakeFs: fakeFileSystem,
  fakeLogger: FakeLogger,
  parameters: string[],
) {
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

  await runCli(["node", "svi", "run", ...parameters]);

  checkProcessExitCalledWith(1);

  expect(fakeFs.fileExists("test.js")).toBe(false);

  expect(
    fakeLogger.contain(
      "If you have no access to an LLM api, you can use the clipboard mode with '-c' flag which allows you to copy the prompt to your clipboard and paste it into an LLM interface of your choice, then paste back the response.",
    ),
  ).toBe(true);
}
