import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import { fastGlobWrapper } from "../../../src/utils/fastGlobWrapper";
import fs from "fs";
import path from "path";

describe("Main fake FS tests", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeFs.applyMocks();
  });

  afterEach(() => {
    fakeFs.restoreMocks();
    vi.clearAllMocks();
  });

  it("Mocked fast-glob sees files added in the fake file system", async () => {
    fakeFs.addFile("globbed.svi", "Globbed content");
    fs.writeFileSync(
      path.join(fakeFs.getCwd(), "anotherGlobbed.svi"),
      "Another globbed content",
    );

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    expect(results).toContain(fakeFs["convPath"]("globbed.svi"));
    expect(results).toContain(fakeFs["convPath"]("anotherGlobbed.svi"));
  });

  it("In subfolders", async () => {
    fakeFs.addFile("subfolder/file1.svi", "File 1 content");
    fs.writeFileSync(
      path.join(fakeFs.getCwd() + "/folder", "anotherGlobbed.svi"),
      "Another globbed content",
    );

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    expect(results).toContain(fakeFs["convPath"]("subfolder/file1.svi"));
    expect(results).toContain(fakeFs["convPath"]("folder/anotherGlobbed.svi"));
  });

  it("Unix style paths", async () => {
    fakeFs.setCwd("/fake/cwd");
    fakeFs.addFile("unixStyle.svi", "Unix style content");
    fs.writeFileSync(
      "/fake/cwd/anotherUnixStyle.svi",
      "Another unix style content",
    );

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    expect(results).toContain(fakeFs["convPath"]("unixStyle.svi"));
    expect(results).toContain(fakeFs["convPath"]("anotherUnixStyle.svi"));
  });
});
