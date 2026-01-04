import { fakeFileSystem } from "../../../testUtils/fakeFileSystem";
import fakeLogger from "../../../testUtils/fakeLogger";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../../testUtils/fakeLLM";
import { vi } from "vitest";

export function beforeEachSimpleTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger,
  testApiKey: string = "testKey"
) {
  fakeFs.applyMocks();
  if (fakeLogger) {
    fakeLogger.applyMocks();
  }
  enableFakeLLMProcessor({ apiKey: testApiKey });
}

export function afterEachSimpleTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger
) {
  disableFakeLLMProcessor();
  fakeFs.restoreMocks();
  vi.clearAllMocks();
  if (fakeLogger) {
    fakeLogger.disableMocks();
  }
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
}
