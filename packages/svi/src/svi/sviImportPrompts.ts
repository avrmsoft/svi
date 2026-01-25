import { SVIFile } from "./types";
import Logger from "../utils/logger";
import path from "path";
import fs from "fs";
import { SVIParser } from "./sviParser";
import { computeHashFromString } from "../utils/utils";
import { fileHasExtension } from "../utils/file";

interface ImportedPrompt {
  prompt: string;
  hash: string;
}

export class SVIImportPrompts {
  private sviFile: SVIFile;
  private importedPrompts: ImportedPrompt[] = [];
  private sviParser: SVIParser = new SVIParser();

  constructor(sviFile: SVIFile) {
    this.sviFile = sviFile;
  }

  public getImportedPrompts(): ImportedPrompt[] {
    return this.importedPrompts;
  }

  public getImportedPromptsAsString(): string {
    return this.importedPrompts.map((imp) => imp.prompt).join("\n---\n");
  }

  public loadImportedPrompts(): boolean {
    return this.loadImportedPromptsFromSvi(this.sviFile);
  }

  private loadImportedPromptsFromSvi(sviFile: SVIFile): boolean {
    if (!sviFile.importPrompts || sviFile.importPrompts.length === 0) {
      return true;
    }

    let success: boolean = true;

    const promptPaths: string[] = sviFile.getImportPromptsFullPaths();

    for (const promptPath of promptPaths) {
      // sviFile.importPrompts) {
      //const resolvedPath = this.resolvePromptPath(promptPath, sviFile);
      if (this.loadPromptForPath(promptPath)) {
        continue;
      }

      if (!promptPath.endsWith(".svi")) {
        const resolvedPathWithExtension = promptPath + ".svi";
        if (this.loadPromptForPath(resolvedPathWithExtension)) {
          continue;
        }
      }

      success = false;
    }

    return success;
  }

  /*private resolvePromptPath(
    promptPath: string,
    relativeToSvi?: SVIFile,
  ): string {
    const relativeToSviFile = relativeToSvi || this.sviFile;
    if (relativeToSviFile.filePath) {
      const sviDir = relativeToSviFile.getSviFileDirectory(); // path.dirname(relativeToSviFile.filePath);
      return path.resolve(sviDir, promptPath);
    }
    return promptPath;
  }*/

  private loadSVIFile(filePath: string): SVIFile | null {
    try {
      //const parser = new SVIParser();
      return this.sviParser.parseFile(filePath);
    } catch (error) {
      Logger.error(`Error loading SVI file ${filePath}: ${error}`);
      return null;
    }
  }

  private computeHash(content: string): string {
    return computeHashFromString(content);
  }

  private loadPromptForPath(path: string): boolean {
    let dependencySVI: SVIFile | null = null;

    if (this.fileHasSviExtension(path)) {
      dependencySVI = this.loadSVIFile(path);
    }

    let promptContent = "";
    let promptHash = "";
    let result = false;

    Logger.trace(`Loading imported prompt from path: ${path}`);

    if (dependencySVI && dependencySVI.prompt) {
      Logger.trace(`Imported prompt is SVI file with prompt section: ${path}`);
      promptContent = dependencySVI.prompt;
    } else {
      Logger.trace(
        `Failed to parse this path as *.svi format: ${path}; will try other options`,
      );
    }

    if (
      !promptContent &&
      !fileHasExtension(path, ".svi") &&
      fs.existsSync(path)
    ) {
      promptContent = fs.readFileSync(path, "utf-8");
      Logger.trace(`Imported prompt loaded as raw file content: ${path}`);
    }

    if (promptContent.length > 0) {
      promptHash = this.computeHash(promptContent);
      if (this.hashExists(promptHash)) {
        Logger.trace(
          `Imported prompt has already been added: ${path}; skipping to avoid a dependency loop`,
        );
        return true;
      }

      this.importedPrompts.push({
        prompt: promptContent,
        hash: promptHash,
      });

      if (dependencySVI?.prompt) {
        Logger.trace(
          "Loading nested imported prompts from SVI dependency for path: " +
            path,
        );
        result = this.loadImportedPromptsFromSvi(dependencySVI);
      } else {
        result = true;
      }
    }

    if (!result) {
      Logger.error(`Failed to load imported prompt from dependency ${path}`);
      this.sviParser.logParseMessages();
    }
    return result;
  }

  private hashExists(hash: string): boolean {
    return this.importedPrompts.some((imp) => imp.hash === hash);
  }

  private fileHasSviExtension(filePath: string): boolean {
    return fileHasExtension(filePath, ".svi");
  }
}
