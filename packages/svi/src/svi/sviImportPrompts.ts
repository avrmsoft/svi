import { SVIFile } from "./types";
import Logger from "../utils/logger";
//import path from "path";
import fs from "fs";
import { SVIParser } from "./sviParser";
import { computeHashFromString } from "../utils/utils";
import { fileHasExtension } from "../utils/file";
import SviDependencies from "./sviDependencies";
import { LLMProcessor } from "../llm/llm";
import { SviConfig } from "../config/config";

interface ImportedPrompt {
  path: string;
  prompt: string;
  hash: string;
}

export class SVIImportPrompts {
  private sviFile: SVIFile;
  private importedPrompts: ImportedPrompt[] = [];
  private sviParser: SVIParser = new SVIParser();
  private llmProcessor: LLMProcessor;
  private config: SviConfig;

  constructor(sviFile: SVIFile, llmProcessor: LLMProcessor, config: SviConfig) {
    this.sviFile = sviFile;
    this.llmProcessor = llmProcessor;
    this.config = config;
  }

  public getImportedPrompts(): ImportedPrompt[] {
    return this.importedPrompts;
  }

  public getImportedPromptsAsString(): string {
    return this.importedPrompts
      .map((imp) => `${imp.path}\n---\n${imp.prompt}`)
      .join("\n---\n");
  }

  public async loadImportedPrompts(): Promise<boolean> {
    return await this.loadImportedPromptsFromSvi(this.sviFile);
  }

  private async loadImportedPromptsFromSvi(sviFile: SVIFile): Promise<boolean> {
    if (!sviFile.importPrompts || sviFile.importPrompts.length === 0) {
      return true;
    }

    let success: boolean = true;

    const promptPaths = sviFile.getImportPromptsFullPaths();

    for (const promptPath of promptPaths) {
      // sviFile.importPrompts) {
      //const resolvedPath = this.resolvePromptPath(promptPath, sviFile);
      if (
        await this.loadPromptForPath(
          promptPath.fullPath,
          promptPath.relativePath,
        )
      ) {
        continue;
      }

      if (!promptPath.fullPath.endsWith(".svi")) {
        const resolvedPathWithExtension = promptPath.fullPath + ".svi";
        if (
          await this.loadPromptForPath(
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

  private async loadPromptForPath(
    fullPath: string,
    relativePath: string,
  ): Promise<boolean> {
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

    if (dependencySVI?.dependencies && dependencySVI.dependencies.length > 0) {
      Logger.trace(
        `Loading SVI dependencies declarations for imported prompt, path: ${fullPath}`,
      );
      const sviDependencies = new SviDependencies(
        this.llmProcessor,
        this.config,
      );
      const loaded =
        await sviDependencies.loadDependenciesDeclarations(dependencySVI);
      if (loaded) {
        const declarations =
          sviDependencies.getDependenciesDeclarationsAsString();
        promptContent = `${declarations}\n\n${promptContent}`;
        Logger.trace(
          `SVI dependencies declarations loaded and prepended to imported prompt content, path: ${fullPath}`,
        );
      } else {
        Logger.error(
          `Failed to load SVI dependencies declarations for imported prompt, path: ${fullPath}`,
        );
      }
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
        result = await this.loadImportedPromptsFromSvi(dependencySVI);
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
