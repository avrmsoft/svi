import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { SVIParser } from "../../src/svi/sviParser/sviParser";

vi.mock("fs");

describe("SVIParser", () => {
  let parser: SVIParser;

  beforeEach(() => {
    parser = new SVIParser();
    vi.resetAllMocks();
  });

  // --- parseFile tests ------------------------------------------------------

  it("should throw if file does not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(() => parser.parseFile("notfound.svi")).toThrow(/File not found/);
  });

  it("should read file content and call parseContent", () => {
    const mockContent = "# Destination File\noutput.txt\n# Prompt\nHello World";
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    const result = parser.parseFile("file.svi");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.destinationFile).toBe("output.txt");
    }
  });

  // --- parseContent tests ---------------------------------------------------

  it("should remove comments and parse all sections", () => {
    const content = `
// This is a single-line comment
# Destination File
output.txt

/* Multi-line
comment */
# Dependencies
dep1
dep2

# Output
result.txt

# Options
Active=True
ProgrammingLanguage=Python

# Import Prompts
file1.svi, file2.svi

# Prompt
Generate something cool
`;

    const result = parser.parseContent(content);

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.destinationFile).toBe("output.txt");
    expect(result.dependencies).toEqual(["dep1", "dep2"]);
    expect(result.output).toEqual(["result.txt"]);
    expect(result.importPrompts).toEqual(["file1.svi", "file2.svi"]);
    expect(result.prompt).toBe("Generate something cool");
    expect(result.options).toEqual({
      Active: true,
      ProgrammingLanguage: "Python",
    });
  });

  it("should handle unknown sections gracefully", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const content = `# UnknownSection\nSome text`;

    const result = parser.parseContent(content);
    parser.logParseMessages();

    expect(result).toEqual({});
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatch(/Unknown section/);
  });

  it("should return empty arrays for empty list sections", () => {
    const content = `# Dependencies\n\n# Output\n\n# Import Prompts\n`;
    const result = parser.parseContent(content);

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.dependencies).toEqual([]);
    expect(result.output).toEqual([]);
    expect(result.importPrompts).toEqual([]);
  });

  // --- parseOptions (private) test via public method ------------------------

  it("should parse boolean and string options correctly", () => {
    const content = `# Options
Flag=True
EmptyValue=
AnotherFlag=False
Language=Node.js
`;

    const result = parser.parseContent(content);

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.options).toEqual({
      Flag: true,
      EmptyValue: "",
      AnotherFlag: false,
      Language: "Node.js",
    });
  });

  // --- splitList (private) indirectly tested above, but also edge case -----

  it("should split comma-separated lists correctly", () => {
    const content = `# Dependencies
file1.js
file2.js
file3.js
`;
    const result = parser.parseContent(content);

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.dependencies).toEqual(["file1.js", "file2.js", "file3.js"]);
  });

  // --- edge case: empty or whitespace-only content --------------------------

  it("should handle empty content safely", () => {
    const result = parser.parseContent("");
    expect(result).toEqual({});
  });
});
