// src/commands/runner/sviProcessor.ts
import path from "path";
import fs from "fs";

import { SVIParser } from "./sviParser";
import { SVIFile } from "./types";
import * as cacheManager from "./cacheManager";
import logger from "../utils/logger";
import { buildPrompt } from "./promptBuilder";
import { LLMProcessor } from "../llm/llm";
import * as fileUtils from "../utils/file";
import { clearContentFromMarkdownCodeMarkers } from "../utils/utils";
import { SviConfig } from "../config/config";

/**
 * Check if file is active (according to options Active=true)
 */
export function isActive(svi: SVIFile): boolean {
  if (!svi.options) return true; // Default is active
  if (svi.options["Active"] === undefined) return true;
  return svi.options["Active"] === true || svi.options["Active"] === "True";
}

/**
 * Load and process a single *.svi file
 */
export async function processSVIFile(
  filePath: string,
  llm: LLMProcessor,
  config: SviConfig,
): Promise<boolean> {
  try {
    const parser = new SVIParser(); //rawContent);
    const svi: SVIFile | null = parser.parseFile(filePath);

    if (!svi) {
      logger.error(`Failed to parse SVI file: ${filePath}`);
      return false;
    }

    // Check if active
    if (!isActive(svi)) {
      logger.info(`Skipping inactive SVI file: ${filePath}`);
      return true;
    }

    // 6) Get destination file from the .svi file (from # Destination File section)
    const destinationFromSvi = svi.destinationFile?.trim();
    if (!destinationFromSvi) {
      logger.info(`No destination file ${filePath} provided. Skipping.`);
      return true;
    }

    const fileFolder = path.dirname(filePath);

    // Check cache
    const cache = new cacheManager.CacheManager(fileFolder);
    if (cache.isCacheValid(filePath)) {
      if (
        !fileUtils.exists(
          fileUtils.constructFullPath(fileFolder, destinationFromSvi),
        )
      ) {
        logger.info(
          `Destination file ${destinationFromSvi} does not exist. Regenerating...`,
        );
      } else {
        logger.info(`Cache is up to date, skipping file: ${filePath}`);
        return true;
      }
    }

    const prompt = buildPrompt(svi, config);

    if (!prompt || prompt.trim().length === 0) {
      logger.error(`Error creating prompt for file: ${filePath}.`);
      return false;
    }

    logger.debug(`Prompt for ${filePath} was built.`);

    logger.info(`Ask LLM for ${filePath}...`);
    const generated = await llm.ask(prompt);
    if (!generated || generated.trim().length === 0) {
      logger.error(
        `LLM returned no result for ${filePath} or error occurred. Skipping.`,
      );
      return false;
    }

    const clearedCode = clearContentFromMarkdownCodeMarkers(generated);

    const destPath = fileUtils.constructFullPath(
      fileFolder,
      destinationFromSvi,
    );
    const destDir = path.dirname(destPath);
    await fileUtils.ensureDir(destDir);

    logger.info(`Write generated code to ${destPath}`);
    await fs.writeFileSync(destPath, clearedCode);

    cache.updateCache(filePath);

    return true;
  } catch (err) {
    logger.error(
      `Error processing SVI file ${filePath}: ${(err as Error).message}`,
    );
    return false;
  }
}
