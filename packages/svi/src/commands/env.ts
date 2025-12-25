import path from "path";
import fs from "fs";
import { config as loadEnv } from "dotenv";
import { DEFAULT_ENV_FILE } from "../utils/constants";
import { toCamelCase } from "../utils/utils.js";

export function enrichOptionsFromEnv(options: any) {
  if (options.env) {
    loadEnv({ path: path.resolve(options.env) });
  } else if (fs.existsSync(path.resolve(DEFAULT_ENV_FILE))) {
    loadEnv({ path: path.resolve(DEFAULT_ENV_FILE) });
  }

  for (const key of Object.keys(process.env)) {
    const envKey = key.toUpperCase();
    const keyCamelCase = toCamelCase(envKey);
    if (options[keyCamelCase] === undefined) {
      options[keyCamelCase] = process.env[envKey];
    }
  }

  if (options.modelName && !options.model) {
    options.model = options.modelName;
  }

  if (options.apiKey && !options.key) {
    options.key = options.apiKey;
  }
}
