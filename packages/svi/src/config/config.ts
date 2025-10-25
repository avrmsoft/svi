import * as fs from "fs";
import * as path from "path";

/**
 * Interface for the structure of svi.json configuration file
 */
export interface SviConfig {
  programmingLanguage: string;
  searchPaths: string[];
  ignorePaths: string[];
}

/**
 * Class for loading and storing of configuration data
 * (Read-only, no write operations)
 */
export class Config {
  private configPath: string;
  private configData: SviConfig;

  constructor(fileName: string = "svi.json") {
    const resolvedPath = path.resolve(process.cwd(), fileName);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found: ${resolvedPath}`);
    }

    this.configPath = resolvedPath;

    const raw = fs.readFileSync(this.configPath, "utf-8");
    try {
      this.configData = JSON.parse(raw) as SviConfig;
    } catch (e) {
      throw new Error(`Invalid JSON in file ${this.configPath}: ${(e as Error).message}`);
    }
  }

  public get path(): string {
    return this.configPath;
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
