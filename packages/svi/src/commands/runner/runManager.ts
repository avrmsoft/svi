// src/commands/runner/runManager.ts
import { SviConfig } from "../../config/config";
import { SviLoader } from "../../svi/sviLoader";
//import { SVIParser } from "../../svi/sviParser/sviParser";
import { processSVIFile } from "../../svi/sviProcessor";
import { LLMProcessor } from "../../llm/llm";
import logger from "../../utils/logger";
import CheckerForRunManager from "./checkerForRunManager";
import RunStatistics from "./runStatistics";
import SviChecks from "../../svi/sviChecks/sviChecks";
import { SviFileToLoad } from "../../svi/types";

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
  private llmBaseUrl?: string;
  private envPath?: string;
  private sviJsonPath?: string;
  private clipboardMode: boolean;
  private onlyLoadFiles: string[] = [];

  constructor(
    config: SviConfig,
    opts?: {
      model?: string;
      service?: string;
      apiKey?: string;
      llmBaseUrl?: string;
      envPath?: string;
      sviJsonPath?: string;
      clipboard?: boolean;
    },
  ) {
    this.config = config;
    this.llmBaseUrl = opts?.llmBaseUrl;
    this.model = opts?.model;
    this.service = opts?.service;
    this.apiKey = opts?.apiKey;
    this.envPath = opts?.envPath;
    this.sviJsonPath = opts?.sviJsonPath;
    this.clipboardMode = opts?.clipboard || false;
  }

  public setOnlyLoadFiles(files: string[]) {
    this.onlyLoadFiles = files;
  }

  /**
   * Main method to run the process
   */
  public async run(): Promise<boolean> {
    try {
      logger.info("RunManager: Search for .svi files...");

      let sviFiles: SviFileToLoad[] = [];

      if (this.onlyLoadFiles.length > 0) {
        logger.info(
          `RunManager: Loading specific .svi files: ${this.onlyLoadFiles.join(", ")}`,
        );
        sviFiles = await new SviLoader(
          this.config,
          undefined,
          this.sviJsonPath !== undefined,
        ).loadSpecificFiles(this.onlyLoadFiles);
        logger.trace(
          `Number of specified .svi files to process: ${sviFiles.length}`,
        );
      } else {
        logger.info("RunManager: Loading all .svi files...");
        sviFiles = await new SviLoader(this.config).loadAll();
      }

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
        service: this.service,
        llmBaseUrl: this.llmBaseUrl,
        envFile: this.envPath,
        clipboardMode: this.clipboardMode,
      });

      let result = true;

      if (sviFiles.length > 0) {
        if (
          !(await CheckerForRunManager.checkOptions({
            modelName: this.model || "",
            service: this.service,
            apiKey: this.apiKey,
            clipboardMode: this.clipboardMode,
          }))
        ) {
          logger.error("Finishing due to LLM parameter errors.");
          return false;
        }
      }

      for (const sviPath of sviFiles) {
        try {
          logger.info(`Processing: ${sviPath.filePath}`);

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
        logger.repeatErrorMessages();
        logger.error("RunManager: Some files failed to process.");
      }

      logger.info("Number of found .svi files: " + sviFiles.length);
      logger.info(
        "Number of processed .svi files: " +
          RunStatistics.getInstance().getTotalFilesProcessed(),
      );
      if (RunStatistics.getInstance().getTotalFilesFailed() > 0) {
        logger.warn(
          "Number of .svi files that failed to process: " +
            RunStatistics.getInstance().getTotalFilesFailed(),
        );
      }
      RunStatistics.getInstance().logWrittenFiles();
      if (RunStatistics.getInstance().getTotalFilesFailed() > 0) {
        RunStatistics.getInstance().logErrorFiles();
      }

      return result;
    } catch (err) {
      logger.error(
        "RunManager: Severe error: " +
          (err as Error).message +
          "\n" +
          (err as Error).stack,
      );
      throw err;
    }
  }

  public additionalChecksBeforeRun(sviFiles: SviFileToLoad[]): boolean {
    //const sviParser = new SVIParser();
    const sviChecks = new SviChecks();
    const result = sviChecks.check(sviFiles);
    if (!result) {
      sviChecks.logErrors();
    }
    return result;
  }
}

export default RunManager;
