// src/commands/runner/sviProcessor.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SVIFile, SVIParser } from '../../parser/sviParser';
import * as cacheManager from "./cacheManager";
import logger from '../../utils/logger';

/**
 * Prüft, ob die Datei aktiv ist (Active=true)
 */
export function isActive(svi: SVIFile): boolean {
    if (!svi.options) return true; // Standardmäßig aktiv
    if (svi.options['Active'] === undefined) return true;
    return svi.options['Active'] === true || svi.options['Active'] === 'True';
}

/**
 * Berechnet den Hash einer Datei
 */
function computeHash(content: string): string {
    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

/**
 * Lädt und verarbeitet eine einzelne *.svi Datei
 */
export async function processSVIFile(filePath: string, cacheFilePath?: string): Promise<SVIFile | null> {
    try {
        //const rawContent = fs.readFileSync(filePath, 'utf8');

        const parser = new SVIParser(); //rawContent);
        const svi: SVIFile = parser.parseFile(filePath);

        // Prüfen, ob aktiv
        if (!isActive(svi)) {
            logger.info(`Skipping inactive SVI file: ${filePath}`);
            return null;
        }

        const fileFolder = path.dirname(filePath);

        // Prüfen Cache
        const cache = new cacheManager.CacheManager(fileFolder);
        if(cache.isCacheValid(filePath)) {
        //const currentHash = computeHash(rawContent);
        //if (cacheFilePath && fs.existsSync(cacheFilePath)) {
        //    const cachedHash = readCache(cacheFilePath, path.basename(filePath));
        //    if (cachedHash && cachedHash === currentHash) {
            logger.info(`Cache is up to date, skipping file: ${filePath}`);
            return null;
            //}
        }

        // Prompt vorbereiten (hier nur das Prompt-Feld aus SVI)
        //svi.rawContent = rawContent; // roher Inhalt bleibt erhalten

        // Nach Bearbeitung: Cache aktualisieren
        //if (cacheFilePath) {
        //    updateCache(cacheFilePath, path.basename(filePath), currentHash);
        //}
        cache.updateCache(filePath);

        return svi;
    } catch (err) {
        logger.error(`Error processing SVI file ${filePath}: ${(err as Error).message}`);
        return null;
    }
}
