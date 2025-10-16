// src/commands/runner/runManager.ts
import path from "path";
import fs from "fs/promises";

import { Config, SviConfig } from "../../config/config";
import { SviLoader } from "./sviLoader";
import { processSVIFile, isActive as sviIsActive } from "./sviProcessor";
import { buildPrompt } from "./promptbuilder";
import * as cacheManager from "./cacheManager";
import { LLM } from "../../llm/llm";
import * as fileUtils from "../../utils/file";
import logger from "../../utils/logger";
import { SVIFile } from "../../parser/sviParser";
//import { CacheMap } from "./types";

/**
 * RunManager
 * Orchestriert:
 *  - Laden der Konfiguration
 *  - Auffinden aller .svi Dateien nach SearchPaths / IgnorePaths
 *  - Prüfen von Active + Cache
 *  - Prompt-Building -> LLM.ask -> Schreiben der erzeugten Datei
 *  - Cache-Aktualisierung (.svicache)
 *
 * Hinweis: Diese Implementierung trifft konservative Annahmen bzgl. Signaturen der Hilfs-Module.
 */
export class RunManager {
  private config!: SviConfig;
  private model?: string;
  private apiKey?: string;
  private envPath?: string;

  constructor(config: SviConfig , opts?: { model?: string; apiKey?: string; envPath?: string }) {
    this.config = config;
    this.model = opts?.model;
    this.apiKey = opts?.apiKey;
    this.envPath = opts?.envPath;
  }

  /**
   * Hauptmethode - startet den Prozess
   */
  public async run(): Promise<void> {
    try {
      //logger.info("RunManager: Lade Konfiguration...");
      //this.config = await Config.load(); // erwartet: static load(): Promise<SviConfig>
      //logger.debug("Konfiguration geladen:", this.config);

      // Falls ProgrammingLanguage in global config vorhanden ist, sie als Default verwenden
      const globalProgrammingLanguage = this.config.ProgrammingLanguage;

      logger.info("RunManager: Search for .svi files...");
      //const sviFiles = await loadSviFiles(this.config.SearchPaths, this.config.IgnorePaths);
      const sviFiles = new SviLoader(this.config).loadAll();

      if (!sviFiles || sviFiles.length === 0) {
        logger.info("No .svi files found. Nothing to do.");
        return;
      }

      logger.info(`Number found .svi files: ${sviFiles.length}`);

      // Instanziere LLM (wir erstellen eine Instanz pro RunManager)
      const llm = new LLM({
        modelName: this.model || '',
        apiKey: this.apiKey,
        envFile: this.envPath,
      });

      // Durch alle .svi Dateien iterieren
      for (const sviPath of sviFiles) {
        try {
          logger.info(`Processing: ${sviPath}`);
          const sviDir = path.dirname(sviPath);
          const sviFilename = path.basename(sviPath);

          // 1) Parsen der .svi Datei
          const sviFile: SVIFile | null = await processSVIFile(sviPath);
          if(!sviFile) {
            logger.error(`Could not parse ${sviFilename}`);
            continue;
          }
          logger.debug(`File ${sviFilename} was parsed`);

          // 2) Active prüfen (wenn Abschnitt fehlt => true)
          if (!sviIsActive(sviFile)) {
            logger.info(`Skipping ${sviFilename}: Active = false`);
            continue;
          }

          // 3) Cache prüfen
          // Cache-Datei: .svicache im selben Ordner wie die .svi Datei
          //let cache: CacheMap = {};
          let cache: cacheManager.CacheManager | null = null;
          try {
            cache = new cacheManager.CacheManager(sviDir);
          } catch (err) {
            // Kein Cache vorhanden — behandeln wir als leeren Cache
            logger.debug(`No cache in ${sviDir}.`);
            //cache = {};
          }

          //const currentHash = await cacheManager.hashFile(sviPath);
          //const cachedHash = cache[sviFilename];

          //if (cachedHash && cachedHash === currentHash) {
          if(cache && cache.isCacheValid(sviFilename)) {
            logger.info(`Cache is up-to-date for ${sviFilename}. Skipping.`);
            continue;
          }

          // 4) Prompt bauen
          // die Prompt-Builder-Funktion verwendet die sections der SVI-Datei
          const prompt = await buildPrompt(sviFile); //, sviFile.options?.ProgrammingLanguage ?? globalProgrammingLanguage);
          logger.debug(`Prompt for ${sviFilename} was built.`);

          // 6) Ziel-Datei bestimmen (aus # Destination File section)
          const destinationFromSvi = sviFile.destinationFile?.trim();
          if (!destinationFromSvi) {
            logger.error(`No destination file ${sviFilename} provided. Skipping.`);
            continue;
          }

          // 6) LLM aufrufen
          logger.info(`Send LLM from for ${sviFilename}...`);
          const generated = await llm.ask(prompt);
          if (!generated || generated.trim().length === 0) {
            logger.error(`LLM returned no result for ${sviFilename}. Skipping.`);
            continue;
          }

          // Destination kann relativ zur .svi Datei sein — mache absolute Pfad
          const destPath = path.isAbsolute(destinationFromSvi)
            ? destinationFromSvi
            : path.resolve(sviDir, destinationFromSvi);

          // Stelle sicher, dass Zielverzeichnis existiert
          const destDir = path.dirname(destPath);
          await fileUtils.ensureDir(destDir);

          // 7) Datei schreiben (überschreiben)
          logger.info(`Schreibe generierten Code nach ${destPath}`);
          await fs.writeFile(destPath, generated, { encoding: "utf8" });

          // 8) Cache aktualisieren (.svicache)
          //cache[sviFilename] = currentHash;
          //await cacheManager.writeCache(sviDir, cache);
          cache?.updateCache
          logger.info(`Cache aktualisiert für ${sviFilename}`);

        } catch (innerErr) {
          logger.error(`Fehler bei Verarbeitung von ${sviPath}: ${(innerErr as Error).message}`);
          // nicht abbrechen — weiter mit nächsten Dateien
        }
      }

      logger.info("RunManager: Fertig.");
    } catch (err) {
      logger.error("RunManager: Schwerer Fehler: " + (err as Error).message);
      throw err;
    }
  }
}

export default RunManager;
