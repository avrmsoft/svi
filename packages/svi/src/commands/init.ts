// src/commands/init.ts
import path from "path";
import Logger from "../utils/logger";
import { writeJSON, exists } from "../utils/file";

interface InitOptions {
  lang?: string;
}

export async function initCommand(
  fileArg?: string, // optionaler Parameter nach "init"
  options: InitOptions = {}
) {
  try {
    const programmingLanguage = options.lang || "unknown";

    // Standard-Struktur für svi.json oder *.svi
    const config = {
      programmingLanguage,
      SearchPaths: [] as string[],
      IgnorePaths: [] as string[],
    };

    let fileName: string;

    if (!fileArg) {
      // Kein Zusatz -> Standard "svi.json"
      fileName = "svi.json";
    } else {
      // Mit Zusatz -> erstelle "<fileArg>.svi"
      const base = path.basename(fileArg, ".svi");
      fileName = `${base}.svi`;
    }

    const targetPath = path.resolve(process.cwd(), fileName);

    if (exists(targetPath)) {
      Logger.warn(`Datei ${fileName} existiert bereits. Vorgang abgebrochen.`);
      return;
    }

    writeJSON(targetPath, config);
    Logger.success(`Konfigurationsdatei erstellt: ${targetPath}`);
  } catch (err) {
    Logger.error("Fehler beim Erstellen der Konfiguration", err);
  }
}
