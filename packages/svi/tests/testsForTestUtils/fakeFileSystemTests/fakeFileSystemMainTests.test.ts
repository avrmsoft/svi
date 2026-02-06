import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import fs from "fs";

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

  it("Should add and read a file", () => {
    fs.writeFileSync("test.txt", "Hello, World!");
    const content = fakeFs.fileContent("test.txt");
    expect(content).toBe("Hello, World!");
  });

  it("Should check if a file exists", () => {
    fs.writeFileSync("exists.txt", "I exist!");
    expect(fakeFs.fileExists("exists.txt")).toBe(true);
    expect(fakeFs.fileExists("doesNotExist.txt")).toBe(false);
  });

  it("Mocked fs sees files added in the fake file system", () => {
    fakeFs.addFile("mocked.txt", "Mocked content");
    const content = fs.readFileSync("mocked.txt", "utf-8");
    expect(content).toBe("Mocked content");
  });

  it("Mocked fs sees files added in the fake file system (exists)", () => {
    fakeFs.addFile("existsMocked.txt", "Exists mocked content");
    expect(fs.existsSync("existsMocked.txt")).toBe(true);
  });
});
