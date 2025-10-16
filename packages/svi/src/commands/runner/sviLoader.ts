import * as fs from "fs";
import * as path from "path";
import { SviConfig } from "../../config/config";
import Logger from "../../utils/logger";

export class SviLoader {
  private config: SviConfig;
  private rootDir: string;

  constructor(config: SviConfig, rootDir: string = process.cwd()) {
    this.config = config;
    this.rootDir = rootDir;
  }

  /**
   * Lädt alle .svi-Dateien entsprechend SearchPaths und IgnorePaths
   */
  public loadAll(): string[] {
    const results: string[] = [];

    for (const searchPath of this.config.SearchPaths) {
      const absSearchPath = path.resolve(this.rootDir, searchPath);
      if (!fs.existsSync(absSearchPath)) {
        Logger.warn(`Search path not found: ${absSearchPath}`);
        continue;
      }

      this.walkDirectory(absSearchPath, results);
    }

    return results;
  }

  /**
   * Rekursives Durchsuchen eines Verzeichnisses
   */
  private walkDirectory(dir: string, results: string[]) {
    // Wenn Pfad ignoriert werden soll → skippen
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
   * Prüfen, ob Pfad in IgnorePaths fällt
   */
  private isIgnored(targetPath: string): boolean {
    return this.config.IgnorePaths.some(ignorePath => {
      const absIgnorePath = path.resolve(this.rootDir, ignorePath);
      return targetPath.startsWith(absIgnorePath);
    });
  }
}
