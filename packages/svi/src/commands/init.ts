// src/commands/init.ts
import path from "path";
import fs from "fs";
import Logger from "../utils/logger";
import { writeJSON, exists } from "../utils/file";
import { type SVIFile } from "../svi/types";
import SviFileClass from "../svi/sviFileClass";
import { fileNameHasSviExtension } from "../utils/utils";

interface InitOptions {
  lang?: string;
}

export function initCommand(
  fileArg?: string, // optionaler Parameter nach "init"
  options: InitOptions = {},
): number {
  try {
    if (fileArg) {
      return createSviFile(fileArg, options);
    } else {
      return createGlobalConfig(options);
    }
  } catch (err) {
    Logger.error("Error creating configuration", err);
    return 1;
  }
}

function createGlobalConfig(options: InitOptions = {}): number {
  const programmingLanguage = options.lang || "";

  const config = {
    programmingLanguage,
    searchPaths: [] as string[],
    ignorePaths: [] as string[],
  };

  const fileName = "svi.json";
  const targetPath = path.resolve(process.cwd(), fileName);
  if (exists(targetPath)) {
    Logger.error(
      `File ${fileName} already exists, the initialization cancelled`,
    );
    return 1;
  }

  config.searchPaths.push("**/*");

  writeJSON(targetPath, config);
  Logger.success(`Configuration created: ${targetPath}`);
  return 0;
}

function createSviFile(fileArg: string, options: InitOptions = {}): number {
  Logger.trace("Creaing a new SVI file template");

  const sviFile: SVIFile = new SviFileClass();
  for (var option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      const value = (options as any)[option];
      if (value !== undefined) {
        (sviFile as any)[option] = value;
      }
    }
  }

  // It can be not only a file name, but also a relative or absolute path. We need to handle all cases.
  Logger.debug(
    `Path requested by user, will detect the absolute path: ${fileArg}`,
  );

  const requestedPath = path.isAbsolute(fileArg)
    ? fileArg
    : path.resolve(process.cwd(), fileArg);

  Logger.debug(
    `The final target absolute path of the new SVI file is: ${fileArg}`,
  );

  let fileName = "";
  if (fileNameHasSviExtension(fileArg)) {
    Logger.debug(`User provided a file name with SVI extension: ${fileArg}`);
    const base = path.basename(fileArg);
    Logger.debug(`Base name extracted: ${base} (from ${fileArg})`);
    fileName = base;
  } else {
    Logger.debug(`User provided a file name without SVI extension: ${fileArg}`);
    const base = path.basename(fileArg);
    Logger.debug(`Base name extracted: ${base} (from ${fileArg})`);
    fileName = `${base}.svi.md`;
  }

  //const base = path.basename(fileArg, ".svi");

  Logger.debug(`Final file name: ${fileName}`);

  const filePath = path.dirname(requestedPath);

  Logger.debug(`Directory path extracted: ${filePath}`);

  const targetPath = path.resolve(filePath, fileName);

  Logger.debug(`Final target path for the new SVI file: ${targetPath}`);

  if (exists(targetPath)) {
    Logger.error(
      `File ${fileName} already exists, the initialization cancelled`,
    );
    return 1;
  }

  // Ensure the directory exists
  if (!exists(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  const contentLines: string[] = [];

  // Destination File
  contentLines.push(`# Destination File`);
  contentLines.push(sviFile.destinationFile || "");

  // Input Parameters
  contentLines.push(`# Dependencies`);
  if (sviFile.dependencies && sviFile.dependencies.length > 0) {
    contentLines.push(...sviFile.dependencies);
  }

  // Output
  contentLines.push(`# Output`);
  if (sviFile.output && sviFile.output.length > 0) {
    contentLines.push(...sviFile.output);
  }

  // Options
  contentLines.push(`# Options`);
  if (sviFile.options) {
    for (const key in sviFile.options) {
      if (Object.prototype.hasOwnProperty.call(sviFile.options, key)) {
        contentLines.push(`${key}=${sviFile.options[key]}`);
      }
    }
  }
  // Standardwerte, falls nichts angegeben
  if (!sviFile.options || !("Active" in sviFile.options)) {
    contentLines.push(`Active=True`);
  }
  if (!sviFile.options || !("ProgrammingLanguage" in sviFile.options)) {
    contentLines.push(`ProgrammingLanguage=${options.lang || ""}`);
  }

  // Import Prompts
  contentLines.push(`# Import prompts`);
  if (sviFile.importPrompts && sviFile.importPrompts.length > 0) {
    contentLines.push(...sviFile.importPrompts);
  }

  // Prompt
  contentLines.push(`# Prompt`);
  if (sviFile.prompt) {
    contentLines.push(sviFile.prompt);
  }

  // 5. Write the file
  fs.writeFileSync(targetPath, contentLines.join("\n"), "utf-8");
  Logger.success(`SVI file template created: ${targetPath}`);
  return 0;
}
