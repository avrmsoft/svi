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
    }
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
  public async run(): Promise<void> {
    try {
      logger.info("RunManager: Search for .svi files...");
      const sviFiles = new SviLoader(this.config).loadAll();

      if (!sviFiles || sviFiles.length === 0) {
        logger.info("No .svi files found. Nothing to do.");
        return;
      }

      logger.info(`Number of found .svi files: ${sviFiles.length}`);

      // Init LLM
      const llm = new LLMProcessor({
        modelName: this.model || "",
        apiKey: this.apiKey,
        envFile: this.envPath,
      });

      for (const sviPath of sviFiles) {
        try {
          logger.info(`Processing: ${sviPath}`);

          await processSVIFile(sviPath, llm, this.config);
        } catch (innerErr) {
          logger.error(
            `Error processing ${sviPath}: ${(innerErr as Error).message}`
          );
        }
      }

      logger.info("RunManager: Done.");
    } catch (err) {
      logger.error("RunManager: Severe error: " + (err as Error).message);
      throw err;
    }
  }
}

export default RunManager;
