// src/utils/file.ts
import fs from "fs";
import path from "path";

/**
 * Prüft, ob ein Pfad existiert
 */
export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Prüft, ob ein Pfad ein Verzeichnis ist
 */
export function isDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Prüft, ob ein Pfad eine Datei ist
 */
export function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Liest eine JSON-Datei
 */
export function readJSON<T = any>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Schreibt eine JSON-Datei (mit schöner Formatierung)
 */
export function writeJSON(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!exists(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Erstellt eine leere Datei mit Inhalt (falls sie nicht existiert)
 */
export function createFileIfNotExists(filePath: string, content: string = ""): void {
  if (!exists(filePath)) {
    const dir = path.dirname(filePath);
    if (!exists(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

/**
 * Holt den aktuellen Projekt-Stammordner (wo `svi.json` liegt)
 */
export function getProjectRoot(startDir: string = process.cwd()): string | null {
  let current = startDir;

  while (true) {
    const sviPath = path.join(current, "svi.json");
    if (exists(sviPath)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) break; // Root erreicht
    current = parent;
  }

  return null;
}
