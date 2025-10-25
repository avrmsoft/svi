// src/commands/runner/sviProcessor.ts
//import fs from 'fs';
import path from 'path';
import fs from "fs/promises";

//import crypto from 'crypto';
import { SVIFile, SVIParser } from '../../parser/sviParser';
import * as cacheManager from "./cacheManager";
import logger from '../../utils/logger';
import { buildPrompt } from "./promptbuilder";
import { LLM } from "../../llm/llm";
import * as fileUtils from "../../utils/file";
import { clearContentFromMarkdownCodeMarkers } from '../../utils/utils';

/**
 * Check if file is active (according to options Active=true)
 */
export function isActive(svi: SVIFile): boolean {
    if (!svi.options) return true; // Default is active
    if (svi.options['Active'] === undefined) return true;
    return svi.options['Active'] === true || svi.options['Active'] === 'True';
}

/**
 * Berechnet den Hash einer Datei
 */
//function computeHash(content: string): string {
//    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
//}

/**
 * Load and process a single *.svi file
 */
export async function processSVIFile(filePath: string, llm: LLM): Promise<boolean | null> {
    try {

        const parser = new SVIParser(); //rawContent);
        const svi: SVIFile = parser.parseFile(filePath);

        // Check if active
        if (!isActive(svi)) {
            logger.info(`Skipping inactive SVI file: ${filePath}`);
            return false;
        }

        // 6) Get destination file from the .svi file (from # Destination File section)
        const destinationFromSvi = svi.destinationFile?.trim();
        if (!destinationFromSvi) {
            logger.error(`No destination file ${filePath} provided. Skipping.`);
            return false;
        }

        const fileFolder = path.dirname(filePath);

        // Check cache
        const cache = new cacheManager.CacheManager(fileFolder);
        if(cache.isCacheValid(filePath)) {
            if(!fileUtils.exists(destinationFromSvi)) {
                logger.info(`Destination file ${destinationFromSvi} does not exist. Regenerating...`);
            } else {
                logger.info(`Cache is up to date, skipping file: ${filePath}`);
                return false;
            }
        }

        const prompt = buildPrompt(svi);
        logger.debug(`Prompt for ${filePath} was built.`);

        logger.info(`Ask LLM for ${filePath}...`);
        const generated = await llm.ask(prompt);
        if (!generated || generated.trim().length === 0) {
            logger.error(`LLM returned no result for ${filePath}. Skipping.`);
            return false;
        }

        const clearedCode = clearContentFromMarkdownCodeMarkers(generated);

        const sviDir = path.dirname(filePath);

        const destPath = path.isAbsolute(destinationFromSvi)
        ? destinationFromSvi
        : path.resolve(sviDir, destinationFromSvi);

        const destDir = path.dirname(destPath);
        await fileUtils.ensureDir(destDir);

        logger.info(`Write generated code to ${destPath}`);
        await fs.writeFile(destPath, clearedCode, { encoding: "utf8" });

        cache.updateCache(filePath);

        return true;
    } catch (err) {
        logger.error(`Error processing SVI file ${filePath}: ${(err as Error).message}`);
        return null;
    }
}
