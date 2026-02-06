import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import { ensureDir } from "../../../src/utils/file";

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

  it("For file", () => {
    fs.writeFileSync(path.join(fakeFs.getCwd(), "test.txt"), "Hello, World!");
    expect(fs.statSync("test.txt").isDirectory()).toBe(false);
  });

  it("For directory", async () => {
    await ensureDir("myDir/subDir");
    expect(fs.statSync("myDir").isDirectory()).toBe(true);
    expect(fs.statSync("myDir/subDir").isDirectory()).toBe(true);
  });

  it("A bug when ensureDir broke isFile", async () => {
    fs.writeFileSync(path.join(fakeFs.getCwd(), "test.txt"), "Hello, World!");
    await ensureDir(fakeFs.getCwd());
    expect(fs.statSync("test.txt").isFile()).toBe(true);
    expect(fs.statSync(fakeFs.getCwd()).isDirectory()).toBe(true);
  });

  it("Unix style", () => {
    fakeFs.setCwd("/tmp");
    const unixPath = "folder/subfolder/file.txt";
    fs.writeFileSync(path.join(fakeFs.getCwd(), unixPath), "Content");
    expect(fs.statSync(unixPath).isDirectory()).toBe(false);
    expect(
      fs.statSync(path.join(fakeFs.getCwd(), "folder/subfolder")).isDirectory(),
    ).toBe(true);
    expect(fakeFs.fileContent(unixPath)).toBe("Content");
  });
});
