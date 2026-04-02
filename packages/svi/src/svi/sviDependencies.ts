// src\svi\sviDependencies.ts
import fs from "fs";
import path from "path";

// Dependencies declarations from other files:
import { SVIFile } from "./types";
import { LLMProcessor } from "../llm/llm";
import { SviConfig } from "../config/config";
import { extractDeclarationsPromptTemplate } from "./prompts/extractDeclarations";
import CacheManager from "../svi/cacheManager";
import logger from "../utils/logger";
import { getRelativePath } from "../utils/file";
import { resolvePath } from "../utils/pathResolver";

export default class SviDependencies {
  private llmProcessor: LLMProcessor;
  private config: SviConfig;
  private isPreliminary: boolean;
  private dependenciesDeclarations: { relativePath: string; content: string }[] = [];
  private processedByLLM: string[] = [];
  private processedByCache: string[] = [];
  private hadNonPreliminaryError: boolean = false;

  constructor(llmProcessor: LLMProcessor, config: SviConfig, isPreliminary: boolean) {
    this.llmProcessor = llmProcessor;
    this.config = config;
    this.isPreliminary = isPreliminary;
    logger.trace("SviDependencies instance created.");
  }

  public async loadDependenciesDeclarations(sviFile: SVIFile): Promise<boolean> {
    logger.trace(`Starting to load dependencies for SVI file: ${sviFile.getSviFileName()}`);
    this.dependenciesDeclarations = []; // Reset for a new load operation
    this.processedByLLM = [];
    this.processedByCache = [];
    this.hadNonPreliminaryError = false; // Reset error flag

    if (!sviFile.dependencies || sviFile.dependencies.length === 0) {
      logger.trace("No dependencies found for this SVI file. Skipping dependency loading.");
      return true;
    }

    for (const curDependency of sviFile.dependencies) {
      logger.trace(`Processing dependency: ${curDependency}`);
      const dependencyFullPath = resolvePath(curDependency, sviFile.getSviFileDirectory());

      if (!fs.existsSync(dependencyFullPath)) {
        const errorMessage = `File '${curDependency}' from 'Dependencies' section not found at path '${dependencyFullPath}'.`;
        if (this.isPreliminary) {
          logger.trace(`(Preliminary mode) Skipping dependency '${curDependency}' as file not found.`);
        } else {
          logger.error(errorMessage);
          this.hadNonPreliminaryError = true;
        }
        continue; // Skip to the next dependency
      }

      const dependencyRelativePath = getRelativePath(dependencyFullPath, this.config.configDir);
      const cacheManager = new CacheManager(path.dirname(dependencyFullPath));
      let declarations: string | null = null;

      logger.trace(`Checking cache for declarations of: ${dependencyRelativePath}`);
      if (cacheManager.isFileExportsCacheValid(dependencyFullPath)) {
        declarations = cacheManager.getFileExportsFromCache(dependencyFullPath);
        if (declarations !== null) {
          logger.trace(`Declarations for '${dependencyRelativePath}' found in cache.`);
          this.dependenciesDeclarations.push({ relativePath: dependencyRelativePath, content: declarations });
          this.processedByCache.push(dependencyRelativePath);
          continue; // Move to the next dependency
        }
      }

      // If not in cache or cache invalid, ask LLM
      logger.info(`LLM will be called to generate declarations for file: ${dependencyRelativePath}`);
      let dependencyFileContent: string;
      try {
        dependencyFileContent = fs.readFileSync(dependencyFullPath, 'utf-8');
      } catch (error) {
        logger.error(`Error reading dependency file '${dependencyFullPath}': ${error}`);
        if (!this.isPreliminary) {
          this.hadNonPreliminaryError = true;
        }
        continue; // Skip to the next dependency
      }

      const programmingLanguagePhrase = this.config.programmingLanguage
        ? `programming language ${this.config.programmingLanguage}`
        : '';

      const prompt = extractDeclarationsPromptTemplate
        .replace('{{programmingLanguage}}', programmingLanguagePhrase)
        .replace('{{sourceCode}}', dependencyFileContent);

      const promptDescription = `Declarations extraction from ${dependencyRelativePath}`;

      declarations = await this.llmProcessor.ask(prompt, undefined, promptDescription);

      if (!declarations) {
        const errorMessage = `LLM returned no declarations for dependency: ${dependencyRelativePath}`;
        logger.error(errorMessage);
        if (!this.isPreliminary) {
          this.hadNonPreliminaryError = true;
        }
        continue; // Skip to the next dependency
      }

      logger.trace(`LLM successfully generated declarations for '${dependencyRelativePath}'. Updating cache.`);
      cacheManager.updateFileExportsInCache(dependencyFullPath, declarations);
      this.dependenciesDeclarations.push({ relativePath: dependencyRelativePath, content: declarations });
      this.processedByLLM.push(dependencyRelativePath);
    }

    if (this.dependenciesDeclarations.length > 0) {
      logger.info(`Dependencies declarations retrieved and added to the main prompt.`);
      if (this.processedByLLM.length > 0) {
        logger.info(`  Generated by LLM: ${this.processedByLLM.join(', ')}`);
      }
      if (this.processedByCache.length > 0) {
        logger.info(`  Taken from cache: ${this.processedByCache.join(', ')}`);
      }
    } else {
        logger.trace("No dependencies declarations were successfully loaded for this SVI file.");
    }

    if (this.hadNonPreliminaryError) {
      logger.debug("One or more non-preliminary errors occurred during dependency loading.");
      return false;
    }

    logger.trace("Finished loading dependencies declarations.");
    return true;
  }

  public getDependenciesDeclarationsAsString(): string {
    logger.trace("Generating combined dependencies declarations string.");
    if (this.dependenciesDeclarations.length === 0) {
      return "";
    }

    return this.dependenciesDeclarations
      .map(dep => `Declarations from file: ${dep.relativePath}\n\n${dep.content}\n`)
      .join('\n');
  }
}