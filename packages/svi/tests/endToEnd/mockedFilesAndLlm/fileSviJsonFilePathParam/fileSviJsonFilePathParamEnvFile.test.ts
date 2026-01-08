import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../../testUtils/fakeLLM";

describe("File svi.json path parameter (-p) (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
  });

  afterEach(() => {
    disableFakeLLMProcessor();
    fakeFs.restoreMocks();
    vi.clearAllMocks();
  });

  it("Check svi.json file path parameter -p", async () => {
    await runTests(fakeFs, "-p", "D:\\test\\svi.json");
  });

  /*it("Check svi.json file path parameter -configPath", async () => {
    await runTests(fakeFs, "--configPath", "D:\\test\\svi.json");
  });

  it("Check svi config file path parameter -p when it contains only folder without filename", async () => {
    await runTests(fakeFs, "--configPath", "D:\\test");
  });*/

  it("Check svi config file path parameter -p when filename not equals to svi.json", async () => {
    await runTests(
      fakeFs,
      "--configPath",
      "D:\\test\\svi_custom.json",
      "svi_custom.json"
    );
  });
});

async function runTests(
  fakeFs: fakeFileSystem,
  parameterKey: string,
  parameterValue: string,
  sviFilename: string = "svi.json"
) {
  fakeFs.addFile(
    `D:\\test\\${sviFilename}`,
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
    "D:\\test\\test.svi",
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

  fakeFs.addFile(
    "D:\\test\\svi.env",
    `API_KEY=testKey
       MODEL_NAME=gemini-2.5-flash`
  );

  fakeFs.applyMocks();

  enableFakeLLMProcessor({ modelName: "gemini-2.5-flash", apiKey: "testKey" });

  await runCli(["node", "svi", "run", parameterKey, parameterValue]);

  expect(fakeFs.fileExists("D:\\test\\test.js")).toBe(true);

  const content = fakeFs.fileContent("D:\\test\\test.js");

  expect(content).toContain("Test prompt");
  expect(content).toContain("Please return only the code");
  expect(content).toContain("without any explanations");
  expect(content).toContain("installation manual");
  expect(content).toContain(
    "The code should fulfill the following requirements"
  );
}
