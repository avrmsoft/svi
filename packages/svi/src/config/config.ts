import * as fs from "fs";
import * as path from "path";

/**
 * Interface für die Struktur von svi.json oder *.svi-Dateien
 */
export interface SviConfig {
  ProgrammingLanguage: string;
  SearchPaths: string[];
  IgnorePaths: string[];
}

/**
 * Klasse zum Laden und Bereitstellen der Konfigurationsdaten
 * (Read-only, keine Schreiboperationen)
 */
export class Config {
  private configPath: string;
  private configData: SviConfig;

  constructor(fileName: string = "svi.json") {
    const resolvedPath = path.resolve(process.cwd(), fileName);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Konfigurationsdatei nicht gefunden: ${resolvedPath}`);
    }

    this.configPath = resolvedPath;

    const raw = fs.readFileSync(this.configPath, "utf-8");
    try {
      this.configData = JSON.parse(raw) as SviConfig;
    } catch (e) {
      throw new Error(`Ungültiges JSON in Datei ${this.configPath}: ${(e as Error).message}`);
    }
  }

  /** Gibt den Pfad der geladenen Datei zurück */
  public get path(): string {
    return this.configPath;
  }

  /** Gibt die gesamte Konfiguration zurück */
  public get data(): SviConfig {
    return this.configData;
  }

  /** Convenience-Getter */
  public get programmingLanguage(): string {
    return this.configData.ProgrammingLanguage;
  }

  public get searchPaths(): string[] {
    return this.configData.SearchPaths;
  }

  public get ignorePaths(): string[] {
    return this.configData.IgnorePaths;
  }
}
