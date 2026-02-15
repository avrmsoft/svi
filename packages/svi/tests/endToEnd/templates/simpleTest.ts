import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import fakeLogger from "../../testUtils/fakeLogger/fakeLogger";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../testUtils/fakeLLM";
//import { vi } from "vitest";
//import { pushProcessEnv, popProcessEnv } from "../../../testUtils/testUtils";
import {
  beforeEachEndToEndTest,
  afterEachEndToEndTest,
} from "../endToEndTestUtils";

export function beforeEachSimpleTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger,
  testApiKey: string = "testKey",
  testModel?: string, // = "gemini-2.5-flash",
  testService?: string, // = "google",
  testLlmBaseUrl?: string, //= "http://fake-llm-base-url.com",
) {
  beforeEachEndToEndTest(fakeFs, fakeLogger);
  /*pushProcessEnv();
  fakeFs.applyMocks();
  if (fakeLogger) {
    fakeLogger.applyMocks();
  }*/
  enableFakeLLMProcessor({
    apiKey: testApiKey,
    modelName: testModel,
    service: testService,
    llmBaseUrl: testLlmBaseUrl,
  });
}

export function afterEachSimpleTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger,
) {
  afterEachEndToEndTest(fakeFs, fakeLogger);
  /*
  popProcessEnv();
  fakeFs.restoreMocks();
  vi.clearAllMocks();
  if (fakeLogger) {
    fakeLogger.disableMocks();
  }*/
  disableFakeLLMProcessor();
}

export function prepareSimpleTest(fakeFs: fakeFileSystem) {
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
}
