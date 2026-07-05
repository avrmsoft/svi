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

  it("Check init command generates a file, user requested *.svi.md extension", async () => {
    fakeFs.applyMocks();

    await runCli(["node", "svi", "init", "test.svi.md"]);

    expect(fakeFs.fileExists("test.svi.md")).toBe(true);

    const content = fakeFs.fileContent("test.svi.md");
    expect(content).toContain("# Destination File");
    expect(content).toContain("# Dependencies");
    expect(content).toContain("# Output");
    expect(content).toContain("# Options");
    expect(content).toContain("# Import prompts");
    expect(content).toContain("# Prompt");
  });
});
