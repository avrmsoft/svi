import fs from "fs";
import path from "path";
import { SviConfig } from "../config/config";
import Logger from "../utils/logger";
import { emitKeypressEvents } from "readline";

export class SviLoader {
  private config: SviConfig;
  private rootDir: string;

  constructor(config: SviConfig, rootDir: string = process.cwd()) {
    this.config = config;
    this.rootDir = rootDir;

    if (this.config.configDir) {
      this.rootDir = this.config.configDir;
    }
  }

  /**
   * Load all .svi-files according to SearchPaths and IgnorePaths
   */
  public loadAll(): string[] {
    const results: string[] = [];

    for (const searchPath of this.config.searchPaths) {
      let absSearchPath: string;
      if (searchPath === "*") {
        absSearchPath = this.rootDir;
      } else {
        absSearchPath = path.resolve(this.rootDir, searchPath);
      }

      if (!fs.existsSync(absSearchPath)) {
        Logger.warn(`Search path not found: ${absSearchPath}`);
        continue;
      }

      this.walkDirectory(absSearchPath, results);
    }

    return results;
  }

  public loadSpecificFiles(files: string[]): string[] {
    const results: string[] = [];

    for (const file of files) {
      const absPath = path.isAbsolute(file)
        ? file
        : path.resolve(this.rootDir, file);

      if (!fs.existsSync(absPath)) {
        throw new Error(`File not found: ${absPath}`);
      }

      if (this.isIgnored(absPath)) {
        throw new Error(`File is ignored by ignorePaths: ${absPath}`);
      }

      if (!absPath.endsWith(".svi")) {
        Logger.warn(`Skipping non-.svi file: ${absPath}`);
        continue;
      }

      results.push(absPath);
    }

    return results;
  }

  /**
   * Recursive search in folders
   */
  private walkDirectory(dir: string, results: string[]) {
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
  }

  /**
   * Check if path is contained in IgnorePaths
   */
  private isIgnored(targetPath: string): boolean {
    return this.config.ignorePaths.some((ignorePath) => {
      const absIgnorePath = path.resolve(this.rootDir, ignorePath);
      return targetPath.startsWith(absIgnorePath);
    });
  }
}
