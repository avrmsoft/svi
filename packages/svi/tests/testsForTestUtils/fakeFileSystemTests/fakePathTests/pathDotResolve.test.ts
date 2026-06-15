import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakePathDotResolve } from "../../../testUtils/fakeFileSystem/fakePath/fakeResolve";

describe("fake path.dotResolve tests", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should resolve a path with parent directory", () => {
    const result = fakePathDotResolve("folder/subfolder", "../file.txt");
    expect(result).toBe("folder/file.txt");
  });

  it("should resolve a path with current directory", () => {
    const result = fakePathDotResolve("folder/subfolder", "./file.txt");
    expect(result).toBe("folder/subfolder/file.txt");
  });

  it("should resolve a path with multiple parent directories", () => {
    const result = fakePathDotResolve(
      "folder/subfolder/inner",
      "../../file.txt",
    );
    expect(result).toBe("folder/file.txt");
  });

  it("should resolve a path with multiple current directories", () => {
    const result = fakePathDotResolve("folder/subfolder/inner", "././file.txt");
    expect(result).toBe("folder/subfolder/inner/file.txt");
  });

  it("should resolve a path with mixed parent and current directories", () => {
    const result = fakePathDotResolve(
      "folder/subfolder/inner",
      ".././file.txt",
    );
    expect(result).toBe("folder/subfolder/file.txt");
  });

  it("should resolve a path with absolute path", () => {
    const result = fakePathDotResolve("/folder/subfolder", "file.txt");
    expect(result).toBe("/folder/subfolder/file.txt");
  });

  it("should resolve a path with absolute path and parent directory", () => {
    const result = fakePathDotResolve("/folder/subfolder", "../file.txt");
    expect(result).toBe("/folder/file.txt");
  });

  it("should resolve a path with absolute path and current directory", () => {
    const result = fakePathDotResolve("/folder/subfolder", "./file.txt");
    expect(result).toBe("/folder/subfolder/file.txt");
  });

  it("should resolve a path with absolute path and multiple parent directories", () => {
    const result = fakePathDotResolve(
      "/folder/subfolder/inner",
      "../../file.txt",
    );
    expect(result).toBe("/folder/file.txt");
  });

  // Same for windows paths
  it("should resolve a windows path with parent directory", () => {
    const result = fakePathDotResolve("folder\\subfolder", "..\\file.txt");
    expect(result).toBe("folder\\file.txt");
  });

  it("should resolve a windows path with current directory", () => {
    const result = fakePathDotResolve("folder\\subfolder", ".\\file.txt");
    expect(result).toBe("folder\\subfolder\\file.txt");
  });

  it("should resolve a windows path with multiple parent directories", () => {
    const result = fakePathDotResolve(
      "folder\\subfolder\\inner",
      "..\\..\\file.txt",
    );
    expect(result).toBe("folder\\file.txt");
  });

  it("should resolve a windows path with multiple current directories", () => {
    const result = fakePathDotResolve(
      "folder\\subfolder\\inner",
      ".\\.\\file.txt",
    );
    expect(result).toBe("folder\\subfolder\\inner\\file.txt");
  });

  it("should resolve a windows path with mixed parent and current directories", () => {
    const result = fakePathDotResolve(
      "folder\\subfolder\\inner",
      "..\\.\\file.txt",
    );
    expect(result).toBe("folder\\subfolder\\file.txt");
  });

  it("should resolve a windows path with absolute path", () => {
    const result = fakePathDotResolve("E:\\folder\\subfolder", "file.txt");
    expect(result).toBe("E:\\folder\\subfolder\\file.txt");
  });

  it("should resolve a windows path with absolute path and parent directory", () => {
    const result = fakePathDotResolve("E:\\folder\\subfolder", "..\\file.txt");
    expect(result).toBe("E:\\folder\\file.txt");
  });

  it("should resolve a windows path with absolute path and current directory", () => {
    const result = fakePathDotResolve("E:\\folder\\subfolder", ".\\file.txt");
    expect(result).toBe("E:\\folder\\subfolder\\file.txt");
  });

  it("should resolve a windows path with absolute path and multiple parent directories", () => {
    const result = fakePathDotResolve(
      "E:\\folder\\subfolder\\inner",
      "..\\..\\file.txt",
    );
    expect(result).toBe("E:\\folder\\file.txt");
  });

  it("should resolve mixed path start windows and end unix", () => {
    const result = fakePathDotResolve(
      "E:\\folder\\subfolder",
      "subsubfolder/subsubfile.txt",
    );
    expect(result).toBe("E:\\folder\\subfolder\\subsubfolder\\subsubfile.txt");
  });

  it("should resolve when the second path is absolute", () => {
    const result = fakePathDotResolve(
      "folder/subfolder",
      "/absolute/path/file.txt",
    );
    expect(result).toBe("/absolute/path/file.txt");
  });

  it("should resolve when the first is windows and the second path is unix absolute", () => {
    const result = fakePathDotResolve(
      "E:\\folder\\subfolder",
      "/absolute/path/file.txt",
    );
    expect(result).toBe("E:\\absolute\\path\\file.txt");
  });
});
