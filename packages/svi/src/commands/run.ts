import { Config } from "../config/config";
import { RunManager } from "../commands/runner/runManager";
import { Logger } from "../utils/logger";

/**
 * CLI-Befehl: run
 * - Lädt die Hauptkonfiguration (svi.json)
 * - Startet den RunManager, der den kompletten Prozess orchestriert
 */
export async function runCommand(options: {
  model?: string;
  apiKey?: string;
  envPath?: string;
}) {
  try {
    Logger.info("🔍 Lade Konfiguration...");

    // Hauptkonfiguration laden (svi.json im Projekt-Stammverzeichnis)
    const config = Config.loadConfig();

    Logger.info("✅ Konfiguration erfolgreich geladen.");
    Logger.debug(`ProgrammingLanguage: ${config.ProgrammingLanguage}`);
    Logger.debug(`SearchPaths: ${config.SearchPaths.join(", ")}`);
    Logger.debug(`IgnorePaths: ${config.IgnorePaths.join(", ")}`);

    // RunManager starten
    const runManager = new RunManager(config, {
      model: options.model,
      apiKey: options.apiKey,
      envPath: options.envPath,
    });

    await runManager.run();

    Logger.info("🎉 Prozess abgeschlossen.");
  } catch (err: any) {
    Logger.error("❌ Fehler beim Ausführen von 'run':");
    Logger.error(err.message || err.toString());
    process.exit(1);
  }
}
