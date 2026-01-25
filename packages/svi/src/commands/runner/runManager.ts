// src/commands/runner/runManager.ts
import { SviConfig } from "../../config/config";
import { SviLoader } from "../../svi/sviLoader";
import { SVIParser } from "../../svi/sviParser";
import { processSVIFile } from "../../svi/sviProcessor";
import { LLMProcessor } from "../../llm/llm";
import logger from "../../utils/logger";
import CheckerForRunManager from "./checkerForRunManager";
import RunStatistics from "./runStatistics";
import SviChecks from "../../svi/sviChecks";

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

      logger.trace("RunManager: Additional checks before run...");
      if (!this.additionalChecksBeforeRun(sviFiles)) {
        logger.error("Finishing due to pre-run check errors.");
        return false;
      }

      // Init LLM
      const llm = new LLMProcessor({
        modelName: this.model || "",
        apiKey: this.apiKey,
        envFile: this.envPath,
      });

      let result = true;

      if (sviFiles.length > 0) {
        if (
          !(await CheckerForRunManager.checkOptions({
            modelName: this.model || "",
            service: this.service,
            apiKey: this.apiKey,
          }))
        ) {
          logger.error("Finishing due to LLM parameter errors.");
          return false;
        }
      }

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

      logger.info("Number of found .svi files: " + sviFiles.length);
      logger.info(
        "Number of processed .svi files: " +
          RunStatistics.getInstance().getTotalFilesProcessed(),
      );
      RunStatistics.getInstance().logWrittenFiles();

      return result;
    } catch (err) {
      logger.error("RunManager: Severe error: " + (err as Error).message);
      throw err;
    }
  }

  public additionalChecksBeforeRun(sviFiles: string[]): boolean {
    const sviParser = new SVIParser();
    const sviChecks = new SviChecks(sviParser);
    const result = sviChecks.check(sviFiles);
    if (!result) {
      sviChecks.logErrors();
    }
    return result;
  }
}

export default RunManager;
