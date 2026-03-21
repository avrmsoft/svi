// src\svi\sviParser\parsedSviDirectory.ts
import { SVIFile } from "../types";
import { SVIParser } from "./sviParser";

export default class ParsedSviDirectory {
  private static instance: ParsedSviDirectory;
  private parsedSviFiles: Map<string, SVIFile | null> = new Map();
  private sviParsers: Map<string, SVIParser> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): ParsedSviDirectory {
    if (!ParsedSviDirectory.instance) {
      ParsedSviDirectory.instance = new ParsedSviDirectory();
    }
    return ParsedSviDirectory.instance;
  }

  public getParsedSviFile(sviFilePath: string): SVIFile | null {
    if (this.parsedSviFiles.has(sviFilePath)) {
      return this.parsedSviFiles.get(sviFilePath)!;
    }

    const parser = new SVIParser();
    this.sviParsers.set(sviFilePath, parser);

    const sviFile = parser.parseFile(sviFilePath);
    this.parsedSviFiles.set(sviFilePath, sviFile);

    return sviFile;
  }

  public logParseMessagesForFile(sviFilePath: string): void {
    const parser = this.sviParsers.get(sviFilePath);
    if (parser) {
      parser.logParseMessages();
    }
  }
}