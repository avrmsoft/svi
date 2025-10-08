// src/commands/runner/runManager.ts
import path from "path";
import fs from "fs/promises";

import { Config, SviConfig } from "../../config/config";
import { loadSviFiles } from "./sviLoader";
import { parseSvi, isActive as sviIsActive, SVIFile } from "./sviProcessor";
import { buildPrompt } from "./promptBuilder";
import * as cacheManager from "./cacheManager";
import { LLM } from "../../llm/llm";
import * as fileUtils from "../../utils/file";
import logger from "../../utils/logger";
import { CacheMap } from "./types";

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

  constructor(opts?: { model?: string; apiKey?: string; envPath?: string }) {
    this.model = opts?.model;
    this.apiKey = opts?.apiKey;
    this.envPath = opts?.envPath;
  }

  /**
   * Hauptmethode - startet den Prozess
   */
  public async run(): Promise<void> {
    try {
      logger.info("RunManager: Lade Konfiguration...");
      this.config = await Config.load(); // erwartet: static load(): Promise<SviConfig>
      logger.debug("Konfiguration geladen:", this.config);

      // Falls ProgrammingLanguage in global config vorhanden ist, sie als Default verwenden
      const globalProgrammingLanguage = this.config.ProgrammingLanguage;

      logger.info("RunManager: Suche nach .svi Dateien...");
      const sviFiles = await loadSviFiles(this.config.SearchPaths, this.config.IgnorePaths);

      if (!sviFiles || sviFiles.length === 0) {
        logger.info("Keine .svi Dateien gefunden. Nichts zu tun.");
        return;
      }

      logger.info(`Gefundene .svi Dateien: ${sviFiles.length}`);

      // Instanziere LLM (wir erstellen eine Instanz pro RunManager)
      const llm = new LLM({
        model: this.model,
        apiKey: this.apiKey,
        envPath: this.envPath,
      });

      // Durch alle .svi Dateien iterieren
      for (const sviPath of sviFiles) {
        try {
          logger.info(`Verarbeite: ${sviPath}`);
          const sviDir = path.dirname(sviPath);
          const sviFilename = path.basename(sviPath);

          // 1) Parsen der .svi Datei
          const sviFile: SVIFile = await parseSvi(sviPath);
          logger.debug(`Parsed SVI ${sviFilename}`, sviFile);

          // 2) Active prüfen (wenn Abschnitt fehlt => true)
          if (!sviIsActive(sviFile)) {
            logger.info(`Skipping ${sviFilename}: Active = false`);
            continue;
          }

          // 3) Cache prüfen
          // Cache-Datei: .svicache im selben Ordner wie die .svi Datei
          let cache: CacheMap = {};
          try {
            cache = await cacheManager.readCache(sviDir);
          } catch (err) {
            // Kein Cache vorhanden — behandeln wir als leeren Cache
            logger.debug(`Kein Cache in ${sviDir}: starte mit leerem Cache.`);
            cache = {};
          }

          const currentHash = await cacheManager.hashFile(sviPath);
          const cachedHash = cache[sviFilename];

          if (cachedHash && cachedHash === currentHash) {
            logger.info(`Cache aktuell für ${sviFilename}. Überspringe.`);
            continue;
          }

          // 4) Prompt bauen
          // die Prompt-Builder-Funktion verwendet die sections der SVI-Datei
          const { prompt, systemPrompt } = await buildPrompt(sviFile, sviFile.options?.ProgrammingLanguage ?? globalProgrammingLanguage);
          logger.debug(`Prompt für ${sviFilename} gebaut.`);

          // 5) LLM aufrufen
          logger.info(`Sende Prompt an LLM für ${sviFilename}...`);
          const generated = await llm.ask(prompt, systemPrompt);
          if (!generated || generated.trim().length === 0) {
            logger.warn(`LLM lieferte keinen Inhalt für ${sviFilename}. Überspringe Schreiben.`);
            continue;
          }

          // 6) Ziel-Datei bestimmen (aus # Destination File section)
          const destinationFromSvi = sviFile.destination?.trim();
          if (!destinationFromSvi) {
            logger.error(`Keine Destination in ${sviFilename} angegeben. Überspringe.`);
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
          cache[sviFilename] = currentHash;
          await cacheManager.writeCache(sviDir, cache);
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
