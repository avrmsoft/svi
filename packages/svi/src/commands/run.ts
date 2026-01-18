import { Config } from "../config/config";
import { RunManager } from "../commands/runner/runManager";
import Logger from "../utils/logger";

/**
 * CLI-command: run
 * - Load the main configuration (svi.json)
 * - Startet den RunManager, der den kompletten Prozess orchestriert
 */
export async function runCommand(options: {
  model?: string;
  service?: string;
  apiKey?: string;
  envPath?: string;
  sviJsonPath?: string;
}) {
  try {
    Logger.info("🔍 Loading configuration...");

    // Load the main configuration (svi.json in the project root directory)
    let config: Config;
    if (options.sviJsonPath) {
      Logger.debug(
        `Using svi.json path from parameter: ${options.sviJsonPath}`,
      );
      config = new Config(options.sviJsonPath);
    } else {
      config = new Config();
    }

    Logger.info("✅ Configuration successfully loaded.");
    Logger.debug(`Programming Language: ${config.programmingLanguage}`);
    Logger.debug(`Search Paths: ${config.searchPaths.join(", ")}`);
    Logger.debug(`Ignore Paths: ${config.ignorePaths.join(", ")}`);

    // RunManager start
    const runManager = new RunManager(config.data, {
      model: options.model,
      apiKey: options.apiKey,
      envPath: options.envPath,
    });

    Logger.debug("Running RunManager...");
    if (await runManager.run()) {
      Logger.info("🎉 Process finished.");
    } else {
      Logger.error(
        "❌ Error(s) occured during processing, not all operations were successful.",
      );
      process.exit(1);
    }
  } catch (err: any) {
    Logger.error("❌ Error while executing 'run':");
    Logger.error(err.message || err.toString());
    process.exit(1);
  }
}
