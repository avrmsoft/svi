import { SVIFile } from "./types";
import Logger from "../utils/logger";
//import path from "path";
import fs from "fs";
//import { SVIParser } from "./sviParser/sviParser";
import ParsedSviDirectory from "./sviParser/parsedSviDirectory";
import { computeHashFromString, fileNameHasSviExtension } from "../utils/utils";
import { fileHasExtension, getRelativePath } from "../utils/file";
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
  //private sviParser: SVIParser = new SVIParser();
  private llmProcessor: LLMProcessor;
  private config: SviConfig;
  private isPreliminary: boolean;
  private sviParserDirectory: ParsedSviDirectory =
    ParsedSviDirectory.getInstance();

  constructor(
    sviFile: SVIFile,
    llmProcessor: LLMProcessor,
    config: SviConfig,
    isPreliminary: boolean = false,
  ) {
    this.sviFile = sviFile;
    this.llmProcessor = llmProcessor;
    this.config = config;
    this.isPreliminary = isPreliminary;
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
      if (
        await this.loadPromptForPath(
          promptPath.fullPath,
          //promptPath.relativePath,
        )
      ) {
        continue;
      }

      if (!promptPath.fullPath.endsWith(".svi")) {
        const resolvedPathWithExtension = promptPath.fullPath + ".svi";
        if (
          await this.loadPromptForPath(
            resolvedPathWithExtension,
            //promptPath.relativePath,
          )
        ) {
          continue;
        }
      }

      if (!promptPath.fullPath.endsWith(".svi.md")) {
        const resolvedPathWithExtension = promptPath.fullPath + ".svi.md";
        if (
          await this.loadPromptForPath(
            resolvedPathWithExtension,
            //promptPath.relativePath,
          )
        ) {
          continue;
        }
      }

      success = false;
    }

    return success;
  }

  private loadSVIFile(filePath: string): SVIFile | null {
    try {
      return this.sviParserDirectory.getParsedSviFile(filePath);
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
    //relativePath: string,
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
      !this.fileHasSviExtension(fullPath) &&
      //!fileHasExtension(fullPath, ".svi") &&
      //!fileHasExtension(fullPath, ".svi.md") &&
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
        this.isPreliminary,
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

      const relativePath = getRelativePath(fullPath, this.config.configDir);

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
        `Error during processing file ${this.sviFile.getSviFileFullPath()}: Failed to load imported prompt (section #Import prompts), it was expected at path ${fullPath}`,
      );
      //this.sviParser.logParseMessages();
      this.sviParserDirectory.logParseMessagesForFile(fullPath);
    }
    return result;
  }

  private hashExists(hash: string): boolean {
    return this.importedPrompts.some((imp) => imp.hash === hash);
  }

  private fileHasSviExtension(filePath: string): boolean {
    return fileNameHasSviExtension(filePath);
  }
}
