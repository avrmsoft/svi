import fs from "fs";
import path from "path";
import { fastGlobWrapper } from "../utils/fastGlobWrapper";
import { SviConfig } from "../config/config";
import Logger from "../utils/logger";
import SviFileOrderOptimizer from "./sviFileOrderOptimizer/sviFileOrderOptimizer";
import ParsedSviDirectory from "./sviParser/parsedSviDirectory";
import { SVIFile, SviFileToLoad } from "./types";
import { fileNameHasSviExtension } from "../utils/utils";

export class SviLoader {
  private config: SviConfig;
  private rootDir: string;
  private ignoredFiles: Set<string> = new Set();

  constructor(
    config: SviConfig,
    rootDir: string = process.cwd(),
    configDirIsPrioritized: boolean = true,
  ) {
    this.config = config;
    this.rootDir = rootDir;

    if (this.config.configDir && configDirIsPrioritized) {
      this.rootDir = this.config.configDir;
    }
  }

  /**
   * Load all .svi-files according to SearchPaths and IgnorePaths
   */
  public async loadAll(): Promise<SviFileToLoad[]> {
    let results: string[] = [];

    //results = await fg(this.config.searchPaths, {
    results = await fastGlobWrapper.fg(this.config.searchPaths, {
      cwd: this.rootDir,
      absolute: true,
    });

    // filter out only *.svi files and ignore ignored paths
    results = results.filter((file) => {
      if (!fileNameHasSviExtension(file)) {
        return false;
      }

      //const normalizedFile = path.resolve(file);

      //return !this.isIgnored(file);
      /*return !ignoredResults.find((ignoredPath) => {
        const normalizedIgnored = path.resolve(ignoredPath);
        return normalizedIgnored === normalizedFile;
      });*/
      return true;
    });

    const resultsAfterIgnore: string[] = [];
    for (const file of results) {
      if (!(await this.isIgnored(file))) {
        resultsAfterIgnore.push(file);
      }
    }

    return this.optimizeResults(resultsAfterIgnore);
  }

  public async loadSpecificFiles(files: string[]): Promise<SviFileToLoad[]> {
    const results: string[] = [];

    for (const file of files) {
      const absPath = path.isAbsolute(file)
        ? file
        : path.resolve(this.rootDir, file);

      if (!fs.existsSync(absPath)) {
        throw new Error(`File not found: ${absPath}`);
      }

      if (await this.isIgnored(absPath)) {
        throw new Error(`File is ignored by ignorePaths: ${absPath}`);
      }

      if (!fileNameHasSviExtension(absPath)) {
        Logger.warn(`Skipping non-.svi file: ${absPath}`);
        continue;
      }

      results.push(absPath);
    }

    return this.optimizeResults(results);
  }

  private optimizeResults(sviFilePaths: string[]): SviFileToLoad[] {
    const parsedSviDirectory = ParsedSviDirectory.getInstance();
    const sviFiles: SVIFile[] = [];
    for (const sviFilePath of sviFilePaths) {
      const sviFile = parsedSviDirectory.getParsedSviFile(sviFilePath);
      if (!sviFile) {
        const errorMessage = `Failed to parse SVI file at path: ${sviFilePath}.`;
        Logger.error(errorMessage);
        parsedSviDirectory.logParseMessagesForFile(sviFilePath);
        throw new Error(errorMessage);
      }
      sviFiles.push(sviFile);
    }
    const optimizer = new SviFileOrderOptimizer(sviFiles);
    return optimizer.computeOptimizedOrder().getOptimizedFiles();
  }

  /**
   * Recursive search in folders
   */
  /*private walkDirectory(dir: string, results: string[]) {
    // When path must be ignored - skip
    if (this.isIgnored(dir)) {
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.walkDirectory(fullPath, results);
      } else if (entry.isFile() && entry.name.endsWith(".svi")) {
        results.push(fullPath);
      }
    }
  }*/

  /**
   * Check if path is contained in IgnorePaths
   */
  /*private isIgnored(targetPath: string): boolean {
    return this.config.ignorePaths.some((ignorePath) => {
      const absIgnorePath = path.resolve(this.rootDir, ignorePath);
      return targetPath.startsWith(absIgnorePath);
    });
  }*/

  private async isIgnored(targetPath: string): Promise<boolean> {
    if (this.config.ignorePaths.length === 0) {
      return false;
    }

    if (this.ignoredFiles.size === 0) {
      const ignoredResults = await fastGlobWrapper.fg(this.config.ignorePaths, {
        cwd: this.rootDir,
        absolute: true,
      });
      for (const ignoredPath of ignoredResults) {
        const normalizedIgnored = path.resolve(ignoredPath);
        this.ignoredFiles.add(normalizedIgnored);
      }
    }

    const normalizedTarget = path.resolve(targetPath);
    return this.ignoredFiles.has(normalizedTarget);
  }
}
