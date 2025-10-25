import fs from "fs";
import path from "path";
import crypto from "crypto";
import yaml from "js-yaml";

export interface CacheEntry {
  file: string;
  hash: string;
}

export class CacheManager {
  private cacheFileName = ".svicache";
  private cache: Map<string, string> = new Map();

  constructor(private sviDir: string) {
    this.loadCache();
  }

  /** Loads the current cache from the YAML file (.svicache) */
  private loadCache() {
    const cachePath = path.join(this.sviDir, this.cacheFileName);
    if (!fs.existsSync(cachePath)) return;

    try {
      const yamlContent = fs.readFileSync(cachePath, "utf-8");
      const data = yaml.load(yamlContent) as Record<string, any> | undefined;
      if (!data) return;

      for (const [file, info] of Object.entries(data)) {
        if (info && typeof info === "object" && "hash" in info) {
          this.cache.set(file, (info as any).hash);
        }
      }
    } catch (err) {
      console.warn("⚠️ Error while reading YAML file:", err);
    }
  }

  /** Saves cache data in YAML format (without deleting other information) */
  private saveCache() {
    const cachePath = path.join(this.sviDir, this.cacheFileName);
    let data: Record<string, any> = {};

    // If file exists → keep existing data
    if (fs.existsSync(cachePath)) {
      try {
        const yamlContent = fs.readFileSync(cachePath, "utf-8");
        data = (yaml.load(yamlContent) as Record<string, any>) || {};
      } catch {
        data = {};
      }
    }

    // Update cache entries
    for (const [file, hash] of this.cache.entries()) {
      const baseName = path.basename(file);
      data[baseName] = { ...(data[baseName] || {}), hash };
    }

    // Save YAML file in formatted form
    const yamlContent = yaml.dump(data, { indent: 2, lineWidth: 120 });
    fs.writeFileSync(cachePath, yamlContent, "utf-8");
  }

  /** Calculates the SHA256 hash of a file */
  private calculateHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    return hashSum.digest("hex");
  }

  /** Checks whether the file is still up to date */
  isCacheValid(fileName: string): boolean {
    const filePath = this.getAbsoluteFilePath(fileName);
    if (!fs.existsSync(filePath)) return false;

    const currentHash = this.calculateHash(filePath);
    this.loadCache();
    const cachedHash = this.cache.get(path.basename(fileName));
    return cachedHash === currentHash;
  }

  /** Updates the cache entry for a file */
  updateCache(sviFileName: string) {
    const filePath = this.getAbsoluteFilePath(sviFileName);

    if (!fs.existsSync(filePath)) return;

    const currentHash = this.calculateHash(filePath);
    this.loadCache();
    this.cache.set(path.basename(sviFileName), currentHash);
    this.saveCache();
  }

  private getAbsoluteFilePath(sviFileName: string): string {
    return path.isAbsolute(sviFileName)
      ? sviFileName
      : path.join(this.sviDir, sviFileName);
  }
}
