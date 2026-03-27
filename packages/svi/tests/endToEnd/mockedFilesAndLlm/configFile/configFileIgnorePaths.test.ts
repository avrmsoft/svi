import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../../templates/simpleTest";
import {
  addSviFile,
  checkGenerationWorked,
  checkGenerationNotWorked,
} from "./utils";

describe("A config file with parameter 'ignorePaths' (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("A config file with parameter 'ignorePaths'", async () => {
    fakeFs.addFile(
      `svi.json`,
      `
      {
        "programmingLanguage": "node.js",
        "searchPaths": [
          "**/*"
        ],
        "ignorePaths": ["not/**"]
      }`,
    );

    addSviFile(fakeFs, "test1.svi", "test1.js", "Test prompt 01");

    addSviFile(
      fakeFs,
      "correct/folder/test2.svi",
      "test2.js",
      "Test prompt 02",
    );
    addSviFile(
      fakeFs,
      "not/included/folder/test3.svi",
      "test3.js",
      "Test prompt 03",
    );

    fakeFs.applyMocks();

    //enableFakeLLMProcessor({ apiKey: "testKey" });

    await runCli([
      "node",
      "svi",
      "run",
      "-m",
      "gemini-2.5-flash",
      "-k",
      "testKey",
    ]);

    checkGenerationWorked(fakeFs, "test1.js", "Test prompt 01");
    checkGenerationWorked(fakeFs, "correct/folder/test2.js", "Test prompt 02");
    checkGenerationNotWorked(fakeFs, "not/included/folder/test3.js");
  });
});
