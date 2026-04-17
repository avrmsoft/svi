import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakePathDotIsAbsolute } from "../../../testUtils/fakeFileSystem/fakePath/fakeIsAbsolute";

describe("fake path.isAbsolute tests", () => {
  it("Unix style absolute path", () => {
    const path = "/absolute/path/to/file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(true);
  });

  it("Unix style absolute path with windows slash", () => {
    const path = "\\absolute\\path\\to\\file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(true);
  });

  it("Windows style absolute path with drive letter", () => {
    const path = "C:\\absolute\\path\\to\\file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(true);
  });

  it("Windows style absolute path with drive letter and forward slashes", () => {
    const path = "C:/absolute/path/to/file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(true);
  });

  it("Windows UNC path with backslashes", () => {
    const path = "\\\\server\\share\\file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(true);
  });

  it("Windows UNC path with forward slashes", () => {
    const path = "//server/share/file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(true);
  });

  it("Relative path", () => {
    const path = "relative/path/to/file.txt";
    expect(fakePathDotIsAbsolute(path)).toBe(false);
  });

  it("Empty string", () => {
    const path = "";
    expect(fakePathDotIsAbsolute(path)).toBe(false);
  });

  it("Single dot (current directory)", () => {
    const path = ".";
    expect(fakePathDotIsAbsolute(path)).toBe(false);
  });

  it("Double dot (parent directory)", () => {
    const path = "..";
    expect(fakePathDotIsAbsolute(path)).toBe(false);
  });

  it("Windows drive letter without path", () => {
    const path = "C:";
    expect(fakePathDotIsAbsolute(path)).toBe(false);
  });
});
