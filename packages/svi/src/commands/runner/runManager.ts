// src/commands/runner/runManager.ts
import { SviConfig } from "../../config/config";
import { SviLoader } from "../../svi/sviLoader";
import { processSVIFile } from "../../svi/sviProcessor";
import { LLMProcessor } from "../../llm/llm";
import logger from "../../utils/logger";

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
  private service?: string;
  private apiKey?: string;
  private envPath?: string;

  constructor(
    config: SviConfig,
    opts?: {
      model?: string;
      service?: string;
      apiKey?: string;
      envPath?: string;
    },
  ) {
    this.config = config;
    this.model = opts?.model;
    this.service = opts?.service;
    this.apiKey = opts?.apiKey;
    this.envPath = opts?.envPath;
  }

  /**
   * Main method to run the process
   */
  public async run(): Promise<boolean> {
    try {
      logger.info("RunManager: Search for .svi files...");
      const sviFiles = new SviLoader(this.config).loadAll();

      if (!sviFiles || sviFiles.length === 0) {
        logger.info("No .svi files found. Nothing to do.");
        return true;
      }

      logger.info(`Number of found .svi files: ${sviFiles.length}`);

      // Init LLM
      const llm = new LLMProcessor({
        modelName: this.model || "",
        apiKey: this.apiKey,
        envFile: this.envPath,
      });

      let result = true;

      for (const sviPath of sviFiles) {
        try {
          logger.info(`Processing: ${sviPath}`);

          if (!(await processSVIFile(sviPath, llm, this.config))) {
            result = false;
          }
        } catch (innerErr) {
          logger.error(
            `Error processing ${sviPath}: ${(innerErr as Error).message}`,
          );
          result = false;
        }
      }

      if (result) {
        logger.info("RunManager: Done.");
      } else {
        logger.error("RunManager: Some files failed to process.");
      }

      return result;
    } catch (err) {
      logger.error("RunManager: Severe error: " + (err as Error).message);
      throw err;
    }
  }
}

export default RunManager;
