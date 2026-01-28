import { SVIFile } from "./types";
import Logger from "../utils/logger";
//import path from "path";
import fs from "fs";
import { SVIParser } from "./sviParser";
import { computeHashFromString } from "../utils/utils";
import { fileHasExtension } from "../utils/file";

interface ImportedPrompt {
  path: string;
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
    return this.importedPrompts
      .map((imp) => `${imp.path}\n---\n${imp.prompt}`)
      .join("\n---\n");
  }

  public loadImportedPrompts(): boolean {
    return this.loadImportedPromptsFromSvi(this.sviFile);
  }

  private loadImportedPromptsFromSvi(sviFile: SVIFile): boolean {
    if (!sviFile.importPrompts || sviFile.importPrompts.length === 0) {
      return true;
    }

    let success: boolean = true;

    const promptPaths = sviFile.getImportPromptsFullPaths();

    for (const promptPath of promptPaths) {
      // sviFile.importPrompts) {
      //const resolvedPath = this.resolvePromptPath(promptPath, sviFile);
      if (
        this.loadPromptForPath(promptPath.fullPath, promptPath.relativePath)
      ) {
        continue;
      }

      if (!promptPath.fullPath.endsWith(".svi")) {
        const resolvedPathWithExtension = promptPath.fullPath + ".svi";
        if (
          this.loadPromptForPath(
            resolvedPathWithExtension,
            promptPath.relativePath,
          )
        ) {
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

  private loadPromptForPath(fullPath: string, relativePath: string): boolean {
    let dependencySVI: SVIFile | null = null;

    if (this.fileHasSviExtension(fullPath)) {
      dependencySVI = this.loadSVIFile(fullPath);
    }

    let promptContent = "";
    let promptHash = "";
    let result = false;

    Logger.trace(`Loading imported prompt from path: ${fullPath}`);

    if (dependencySVI && dependencySVI.prompt) {
      Logger.trace(
        `Imported prompt is SVI file with prompt section: ${fullPath}`,
      );
      promptContent = dependencySVI.prompt;
    } else {
      Logger.trace(
        `Failed to parse this path as *.svi format: ${fullPath}; will try other options`,
      );
    }

    if (
      !promptContent &&
      !fileHasExtension(fullPath, ".svi") &&
      fs.existsSync(fullPath)
    ) {
      promptContent = fs.readFileSync(fullPath, "utf-8");
      Logger.trace(`Imported prompt loaded as raw file content: ${fullPath}`);
    }

    if (promptContent.length > 0) {
      promptHash = this.computeHash(promptContent);
      if (this.hashExists(promptHash)) {
        Logger.trace(
          `Imported prompt has already been added: ${fullPath}; skipping to avoid a dependency loop`,
        );
        return true;
      }

      this.importedPrompts.push({
        path: relativePath,
        prompt: promptContent,
        hash: promptHash,
      });

      if (dependencySVI?.prompt) {
        Logger.trace(
          "Loading nested imported prompts from SVI dependency for path: " +
            fullPath,
        );
        result = this.loadImportedPromptsFromSvi(dependencySVI);
      } else {
        result = true;
      }
    }

    if (!result) {
      Logger.error(
        `Failed to load imported prompt from dependency ${fullPath}`,
      );
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
