import fs from "fs";
import path from "path";
import crypto from "crypto";
import yaml from "js-yaml";
import logger from "../utils/logger"; // Assuming logger exists at this path

interface SviFileCacheEntry {
  hash: string;
}

interface DependencyExportsCacheEntry {
  hash: string;
  exports: string;
}

interface CacheContent {
  ProcessedSviFilesHash: {
    [filename: string]: SviFileCacheEntry;
  };
  GeneratedDepenenciesExports: {
    [dependencyFilename: string]: DependencyExportsCacheEntry;
  };
}

const CACHE_FILE_NAME = ".svicache";

export default class CacheManager {
  private cacheDirectory: string;
  private cacheFilePath: string;

  constructor(directory: string) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    this.cacheDirectory = directory;
    this.cacheFilePath = path.join(directory, CACHE_FILE_NAME);
  }

  /**
   * Resolves the full path to a file, considering if the input is already a full path
   * or just a filename relative to the cache directory.
   * @param filename The input filename, can be a full path or a base filename.
   * @returns The resolved full path to the file.
   */
  private _resolveFilePath(filename: string): string {
    return path.isAbsolute(filename) ? filename : path.join(this.cacheDirectory, filename);
  }

  /**
   * Calculates the SHA256 hash of a file's content.
   * @param filePath The full path to the file.
   * @returns The SHA256 hash as a string, or null if the file cannot be read.
   */
  private _calculateFileHash(filePath: string): string | null {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash("sha256").update(fileBuffer).digest("hex");
    } catch (error) {
      logger.error(`Failed to calculate hash for file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Loads the cache content from the .svicache file.
   * If the file doesn't exist or is invalid, returns an empty default structure.
   * @returns The parsed cache content.
   */
  private _loadCache(): CacheContent {
    if (!fs.existsSync(this.cacheFilePath)) {
      return {
        ProcessedSviFilesHash: {},
        GeneratedDepenenciesExports: {},
      };
    }

    try {
      const fileContent = fs.readFileSync(this.cacheFilePath, "utf8");
      const cache = yaml.load(fileContent) as Partial<CacheContent>; // Use Partial for initial load
      return {
        ProcessedSviFilesHash: cache.ProcessedSviFilesHash || {},
        GeneratedDepenenciesExports: cache.GeneratedDepenenciesExports || {},
      };
    } catch (error) {
      logger.warn(`Failed to load or parse cache file ${this.cacheFilePath}: ${error instanceof Error ? error.message : String(error)}. Returning empty cache.`);
      return {
        ProcessedSviFilesHash: {},
        GeneratedDepenenciesExports: {},
      };
    }
  }

  /**
   * Saves the provided cache content to the .svicache file.
   * @param cache The cache content to save.
   */
  private _saveCache(cache: CacheContent): void {
    try {
      const yamlContent = yaml.dump(cache);
      fs.writeFileSync(this.cacheFilePath, yamlContent, "utf8");
    } catch (error) {
      logger.error(`Failed to save cache file ${this.cacheFilePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Checks if the cache for a given SVI file is valid.
   * @param filename The SVI filename (can be full path or basename).
   * @returns True if the file's hash matches the one in the cache, false otherwise.
   */
  public isSviCacheValid(filename: string): boolean {
    const cacheKey = path.basename(filename);
    const resolvedFilePath = this._resolveFilePath(filename);

    const cache = this._loadCache();
    const cachedEntry = cache.ProcessedSviFilesHash[cacheKey];

    if (!cachedEntry || !cachedEntry.hash) {
      return false; // Not found in cache or malformed entry
    }

    const currentHash = this._calculateFileHash(resolvedFilePath);
    if (currentHash === null) {
      // Failed to calculate hash for the current file, treat as invalid
      return false;
    }

    return cachedEntry.hash === currentHash;
  }

  /**
   * Updates the hash for a specific SVI file in the cache.
   * Other cache data remains untouched.
   * @param sviFileName The SVI filename (can be full path or basename).
   */
  public updateSviCache(sviFileName: string): void {
    const cacheKey = path.basename(sviFileName);
    const resolvedFilePath = this._resolveFilePath(sviFileName);

    const currentHash = this._calculateFileHash(resolvedFilePath);
    if (currentHash === null) {
      logger.warn(`Could not update SVI cache for ${sviFileName}: Failed to calculate hash.`);
      return;
    }

    const cache = this._loadCache();
    cache.ProcessedSviFilesHash[cacheKey] = { hash: currentHash };
    this._saveCache(cache);
    logger.debug(`Updated SVI cache for ${sviFileName}`);
  }

  /**
   * Checks if the exports cache for a given dependency file is valid.
   * @param dependencyFilename The dependency filename (can be full path or basename).
   * @returns True if the file's hash matches the one in the cache, false otherwise.
   */
  public isFileExportsCacheValid(dependencyFilename: string): boolean {
    const cacheKey = path.basename(dependencyFilename);
    const resolvedFilePath = this._resolveFilePath(dependencyFilename);

    const cache = this._loadCache();
    const cachedEntry = cache.GeneratedDepenenciesExports[cacheKey];

    if (!cachedEntry || !cachedEntry.hash) {
      return false; // Not found in cache or malformed entry
    }

    const currentHash = this._calculateFileHash(resolvedFilePath);
    if (currentHash === null) {
      // Failed to calculate hash for the current file, treat as invalid
      return false;
    }

    return cachedEntry.hash === currentHash;
  }

  /**
   * Retrieves the 'exports' content for a dependency file from the cache,
   * but only if the cached hash matches the current file's hash.
   * @param dependencyFilename The dependency filename (can be full path or basename).
   * @returns The cached 'exports' string if valid, otherwise null.
   */
  public getFileExportsFromCache(dependencyFilename: string): string | null {
    const cacheKey = path.basename(dependencyFilename);
    const resolvedFilePath = this._resolveFilePath(dependencyFilename);

    const cache = this._loadCache();
    const cachedEntry = cache.GeneratedDepenenciesExports[cacheKey];

    if (!cachedEntry || !cachedEntry.hash || cachedEntry.exports === undefined) {
      return null; // Not found in cache or malformed entry
    }

    const currentHash = this._calculateFileHash(resolvedFilePath);
    if (currentHash === null || cachedEntry.hash !== currentHash) {
      return null; // File changed or hash calculation failed
    }

    return cachedEntry.exports;
  }

  /**
   * Updates the 'exports' and hash for a dependency file in the cache.
   * Other cache data remains untouched.
   * @param dependencyFilename The dependency filename (can be full path or basename).
   * @param exports The exports string to cache.
   */
  public updateFileExportsInCache(dependencyFilename: string, exports: string): void {
    const cacheKey = path.basename(dependencyFilename);
    const resolvedFilePath = this._resolveFilePath(dependencyFilename);

    const currentHash = this._calculateFileHash(resolvedFilePath);
    if (currentHash === null) {
      logger.warn(`Could not update dependency exports cache for ${dependencyFilename}: Failed to calculate hash.`);
      return;
    }

    const cache = this._loadCache();
    cache.GeneratedDepenenciesExports[cacheKey] = {
      hash: currentHash,
      exports: exports,
    };
    this._saveCache(cache);
    logger.debug(`Updated dependency exports cache for ${dependencyFilename}`);
  }
}