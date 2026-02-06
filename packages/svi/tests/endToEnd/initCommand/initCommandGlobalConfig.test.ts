import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";
import { prepareForComparison } from "../../testUtils/testUtils";

describe("Test of 'svi init' command (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  const DEFAULT_SVI_JSON_CONTENT = `{
  "programmingLanguage": "",
  "searchPaths": [
    "**/*"
  ],
  "ignorePaths": []
}`;

  it("Check init command generates a file", async () => {
    fakeFs.applyMocks();

    await runCli(["node", "svi", "init"]);

    expect(fakeFs.fileExists("svi.json")).toBe(true);

    const content = fakeFs.fileContent("svi.json");

    expect(prepareForComparison(content)).toContain(
      prepareForComparison(DEFAULT_SVI_JSON_CONTENT),
    );
  });
});
