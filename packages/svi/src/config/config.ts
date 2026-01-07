import fs from "fs";
import path from "path";
import * as fileUtils from "../utils/file.js";
import logger from "../utils/logger.js";

/**
 * Interface for the structure of svi.json configuration file
 */
export interface SviConfig {
  programmingLanguage: string;
  searchPaths: string[];
  ignorePaths: string[];
  configDir: string;
}

/**
 * Class for loading and storing of configuration data
 * (Read-only, no write operations)
 */
export class Config {
  private configPath: string;
  private configDir: string;
  private configData: SviConfig;

  constructor(fileName: string = "svi.json") {
    logger.trace(
      `Searching configuration file (svi.json) with name: ${fileName}`
    );

    let resolvedPath: string;

    if (path.isAbsolute(fileName)) {
      logger.debug(
        `Absolute path provided for configuration file: ${fileName}`
      );

      if (fileUtils.isFile(fileName)) {
        logger.debug(`Configuration file found at absolute path: ${fileName}`);
        resolvedPath = fileName;
      } else {
        logger.debug(
          `Given absolute path is not a file. Looking for svi.json inside the directory: ${fileName}`
        );
        resolvedPath = path.join(fileName, "svi.json");
      }
    } else {
      logger.debug(
        `Relative path provided for configuration file: ${fileName}. Resolving relative to current working directory.`
      );
      resolvedPath = path.resolve(process.cwd(), fileName);
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found: ${resolvedPath}`);
    }

    this.configPath = resolvedPath;
    this.configDir = path.dirname(this.configPath);

    logger.trace(`Loading configuration from: ${this.configPath}`);

    const raw = fs.readFileSync(this.configPath, "utf-8");
    try {
      this.configData = JSON.parse(raw) as SviConfig;
    } catch (e) {
      throw new Error(
        `Invalid JSON in file ${this.configPath}: ${(e as Error).message}`
      );
    }

    this.configData.configDir = this.configDir;

    logger.trace(
      `Configuration loaded. Programming Language: ${
        this.configData.programmingLanguage
      }, Search Paths: ${this.configData.searchPaths.join(
        ", "
      )}, Ignore Paths: ${this.configData.ignorePaths.join(", ")}`
    );
  }

  public get path(): string {
    return this.configPath;
  }

  public get dir(): string {
    return this.configDir;
  }

  public get data(): SviConfig {
    return this.configData;
  }

  public get programmingLanguage(): string {
    return this.configData.programmingLanguage;
  }

  public get searchPaths(): string[] {
    return this.configData.searchPaths;
  }

  public get ignorePaths(): string[] {
    return this.configData.ignorePaths;
  }
}
