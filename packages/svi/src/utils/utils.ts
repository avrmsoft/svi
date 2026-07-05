import { SVIOptionValue } from "../svi/types";
import crypto from "crypto";

const SVI_EXTENSIONS = [".svi", ".svi.md"];

export function optionValueAsString(value: SVIOptionValue): string {
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  return value;
}

export function clearContentFromMarkdownCodeMarkers(content: string): string {
  // Entfernt ```language und ``` aus dem Inhalt
  return content
    .replace(/```[a-zA-Z0-9]*\n/g, "")
    .replace(/```/g, "")
    .trim();
}

export function computeHashFromString(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function toCamelCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

export function fileNameHasSviExtension(fileName: string): boolean {
  const lowerCaseFileName = fileName.toLowerCase();
  return SVI_EXTENSIONS.some((ext) => lowerCaseFileName.endsWith(ext));
}

export function deleteSviExtensionFromFileName(fileName: string): string {
  for (const ext of SVI_EXTENSIONS) {
    if (fileName.toLowerCase().endsWith(ext)) {
      return fileName.slice(0, -ext.length);
    }
  }
  return fileName;
}

export function getSviExtensionFromFileName(fileName: string): string | null {
  for (const ext of SVI_EXTENSIONS) {
    if (fileName.toLowerCase().endsWith(ext)) {
      return ext;
    }
  }
  return null;
}
