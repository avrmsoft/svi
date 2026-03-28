import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runCli } from "../../../src/commands/entryPoint";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import {
  beforeEachSimpleTest,
  afterEachSimpleTest,
} from "../templates/simpleTest";

describe("Test of 'svi init <file.svi>' command (E2E)", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    beforeEachSimpleTest(fakeFs);
  });

  afterEach(() => {
    afterEachSimpleTest(fakeFs);
  });

  it("Check init command generates a file in an absolute path", async () => {
    fakeFs.applyMocks();

    await runCli(["node", "svi", "init", "c:\\other\\subfolder\\test.svi"]);

    expect(fakeFs.fileExists("c:\\other\\subfolder\\test.svi")).toBe(true);

    const content = fakeFs.fileContent("c:\\other\\subfolder\\test.svi");
    expect(content).toContain("# Destination File");
    expect(content).toContain("# Dependencies");
    expect(content).toContain("# Output");
    expect(content).toContain("# Options");
    expect(content).toContain("# Import prompts");
    expect(content).toContain("# Prompt");
  });
});
