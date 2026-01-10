import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import fakeLogger from "../../../testUtils/fakeLogger";
import {
  enableFakeLLMProcessor,
  disableFakeLLMProcessor,
} from "../../../testUtils/fakeLLM";
import { vi } from "vitest";
import { pushProcessEnv, popProcessEnv } from "../../../testUtils/testUtils";

export function beforeEachSimpleTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger,
  testApiKey: string = "testKey"
) {
  pushProcessEnv();
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
  popProcessEnv();
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
