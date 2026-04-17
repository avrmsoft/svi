import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isFile } from "../../../src/utils/file";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";

describe("File Utils Tests", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeFs.setCwd("D:\\test");
    fakeFs.applyMocks();
  });

  afterEach(() => {
    fakeFs.restoreMocks();
    vi.clearAllMocks();
  });

  it("Is file", () => {
    fakeFs.addFile("D:\\test\\path\\to\\file.txt", "File content");
    const filePath = "path\\to\\file.txt";
    expect(isFile(filePath)).toBe(true);
  });

  it("Is file", () => {
    fakeFs.addFile("D:\\path\\to\\file.txt", "File content");
    const filePath = "D:\\path\\to\\file.txt";
    expect(isFile(filePath)).toBe(true);
  });

  it("Is file", () => {
    fakeFs.addFile("D:\\path\\to\\file.txt", "File content");
    const filePath = "D:/path/to/file.txt";
    expect(isFile(filePath)).toBe(true);
  });

  it("Is file", () => {
    fakeFs.addFile("/path/to/file.txt", "File content");
    const filePath = "/path/to/file.txt";
    expect(isFile(filePath)).toBe(true);
  });

  it("Is file - not existing", () => {
    const filePath = "/path/to/file.txt";
    expect(isFile(filePath)).toBe(false);
  });

  it("Is file - negative", () => {
    fakeFs.addFile("/path/to/folder/file.txt", "File content");
    const filePath = "/path/to/folder";
    expect(isFile(filePath)).toBe(false);
  });

  it("Is file - negative", () => {
    fakeFs.addFile("D:\\path\\to\\folder\\file.txt", "File content");
    const filePath = "D:\\path\\to\\folder";
    expect(isFile(filePath)).toBe(false);
  });

  it("Is file - negative", () => {
    fakeFs.addFile("D:/path/to/folder/file.txt", "File content");
    const filePath = "D:/path/to/folder";
    expect(isFile(filePath)).toBe(false);
  });

  it("Is file - negative", () => {
    fakeFs.addFile("D:/test/path/to/folder/file.txt", "File content");
    const filePath = "path/to/folder";
    expect(isFile(filePath)).toBe(false);
  });

  it("Is file - negative", () => {
    fakeFs.addFile("D:\\test\\path\\to\\folder\\file.txt", "File content");
    const filePath = "path\\to\\folder";
    expect(isFile(filePath)).toBe(false);
  });
});
