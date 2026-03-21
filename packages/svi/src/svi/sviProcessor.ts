// src/commands/runner/sviProcessor.ts
import path from "path";
import fs from "fs";

//import { SVIParser } from "./sviParser/sviParser";
import ParsedSviDirectory from "./sviParser/parsedSviDirectory";
import { SVIFile, SviFileToLoad } from "./types";
import CacheManager from "./cacheManager";
import logger from "../utils/logger";
import { buildPrompt } from "./promptBuilder";
import { LLMProcessor } from "../llm/llm";
import * as fileUtils from "../utils/file";
import { clearCodeInLlmResponse } from "../utils/codeClear";
import { SviConfig } from "../config/config";
import RunStatistics from "../commands/runner/runStatistics";

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
  sviFileToLoad: SviFileToLoad,
  llm: LLMProcessor,
  config: SviConfig,
): Promise<boolean> {
  try {
    const sviParserDirectory = ParsedSviDirectory.getInstance();
    const svi: SVIFile | null = sviParserDirectory.getParsedSviFile(
      sviFileToLoad.filePath,
    );
    const runStatistics = RunStatistics.getInstance();

    if (!svi) {
      logger.error(`Failed to parse SVI file: ${sviFileToLoad.filePath}`);
      runStatistics.addFileFailed(sviFileToLoad.filePath);
      return false;
    }

    // Check if active
    if (!isActive(svi)) {
      logger.info(`Skipping inactive SVI file: ${sviFileToLoad.filePath}`);
      return true;
    }

    // 6) Get destination file from the .svi file (from # Destination File section)
    const destinationFromSvi = svi.destinationFile?.trim();
    if (!destinationFromSvi) {
      logger.info(
        `No destination file ${sviFileToLoad.filePath} provided. Skipping.`,
      );
      return true;
    }

    const fileFolder = path.dirname(sviFileToLoad.filePath);

    // Check cache
    const cache = new CacheManager(fileFolder);
    if (cache.isSviCacheValid(sviFileToLoad.filePath)) {
      if (!fileUtils.exists(svi.getDestinationFileFullPath() || "")) {
        logger.info(
          `Destination file ${destinationFromSvi} does not exist. Regenerating...`,
        );
      } else {
        logger.info(
          `Cache is up to date, skipping file: ${sviFileToLoad.filePath}`,
        );
        return true;
      }
    }

    sviParserDirectory.logParseMessagesForFile(sviFileToLoad.filePath);
    logger.trace(`Building prompt for file: ${sviFileToLoad.filePath}`);

    const prompt = await buildPrompt(
      svi,
      config,
      llm,
      sviFileToLoad.isPreliminary,
    );

    if (!prompt || prompt.trim().length === 0) {
      logger.error(
        `Error creating prompt for file: ${sviFileToLoad.filePath}.`,
      );
      runStatistics.addFileFailed(sviFileToLoad.filePath);
      return false;
    }

    logger.debug(`Prompt for ${sviFileToLoad.filePath} was built.`);

    logger.info(`Ask LLM for ${sviFileToLoad.filePath}...`);
    const promptDescription = `Generation for SVI file ${svi.getSviFileRelativePath()}`;
    const generated = await llm.ask(prompt, undefined, promptDescription);
    if (!generated || generated.trim().length === 0) {
      logger.error(
        `LLM returned no result for ${sviFileToLoad.filePath} or error occurred. Skipping.`,
      );
      runStatistics.addFileFailed(sviFileToLoad.filePath);
      return false;
    }

    const clearedCode = clearCodeInLlmResponse(generated);

    const destPath = fileUtils.constructFullPath(
      fileFolder,
      destinationFromSvi,
    );
    const destDir = path.dirname(destPath);
    await fileUtils.ensureDir(destDir);

    logger.info(`Write generated code to ${destPath}`);

    const fileIsNew = !(await fileUtils.exists(destPath));
    await fs.writeFileSync(destPath, clearedCode);

    if (!sviFileToLoad.isPreliminary) {
      cache.updateSviCache(sviFileToLoad.filePath);
    }

    if (fileIsNew) {
      runStatistics.addFileCreated(destPath);
    } else {
      runStatistics.addFileUpdated(destPath);
    }

    return true;
  } catch (err) {
    logger.error(
      `Error processing SVI file ${sviFileToLoad.filePath}: ${(err as Error).message}`,
    );
    return false;
  }
}
