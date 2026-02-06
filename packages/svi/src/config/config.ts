import fs from "fs";
import path from "path";
import * as fileUtils from "../utils/file.js";
import logger from "../utils/logger.js";
import ConfigFinder from "./configFinder";

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
 * Singleton class for loading and storing configuration data
 * (Read-only, no write operations)
 */
export class Config {
  private static instance: Config | null = null;

  private configPath: string;
  private configDir: string;
  private configData: SviConfig;

  /**
   * Private constructor – use getInstance()
   */
  private constructor(
    fileName: string = "svi.json",
    tryToFindConfigInParentDirs: boolean = false,
  ) {
    logger.trace(
      `Searching configuration file (svi.json) with name: ${fileName}`,
    );

    let resolvedPath: string;

    if (path.isAbsolute(fileName)) {
      logger.debug(
        `Absolute path provided for configuration file: ${fileName}`,
      );

      if (fileUtils.isFile(fileName)) {
        resolvedPath = fileName;
      } else {
        resolvedPath = path.join(fileName, "svi.json");
      }
    } else {
      resolvedPath = path.resolve(process.cwd(), fileName);
    }

    if (!fs.existsSync(resolvedPath) && tryToFindConfigInParentDirs) {
      logger.debug(
        `Configuration file not found at provided path: ${resolvedPath}. Trying to find in parent directories...`,
      );
      const foundInParents = this.tryToFindConfigInParentDirs(process.cwd());
      if (foundInParents) {
        logger.debug(
          `Configuration file found in parent directory: ${foundInParents}`,
        );
        resolvedPath = foundInParents;
      } else {
        logger.debug(`Configuration file not found in any parent directories.`);
      }
    }

    if (!fs.existsSync(resolvedPath)) {
      logger.error(
        `Configuration file not found at path: ${resolvedPath}.
Please run the command in a directory containing svi.json file; usually it should be your project root.
If you haven't created svi.json yet, you can run 'svi init' command.`,
      );
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
        `Invalid JSON in file ${this.configPath}: ${(e as Error).message}`,
      );
    }

    this.configData.configDir = this.configDir;

    logger.trace(
      `Configuration loaded. Programming Language: ${
        this.configData.programmingLanguage
      }, Search Paths: ${this.configData.searchPaths.join(
        ", ",
      )}, Ignore Paths: ${this.configData.ignorePaths.join(", ")}`,
    );
  }

  /**
   * Returns the singleton instance
   */
  public static getInstance(
    fileName?: string,
    tryToFindConfigInParentDirs?: boolean,
  ): Config {
    if (!Config.instance) {
      Config.instance = new Config(fileName, tryToFindConfigInParentDirs);
    }
    return Config.instance;
  }

  // ---------- getters ----------

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

  private tryToFindConfigInParentDirs(startingFolder: string): string | null {
    const finder = new ConfigFinder();
    const foundPath = finder.findConfigFile(startingFolder);
    return foundPath;
  }
}
