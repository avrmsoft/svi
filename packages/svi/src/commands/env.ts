import path from "path";
import fs from "fs";
import { config as loadEnv } from "dotenv";
import { DEFAULT_ENV_FILE } from "../utils/constants";
import { toCamelCase } from "../utils/utils.js";

export function enrichOptionsFromEnv(options: any, possibleOptions?: string[]) {
  if (options.env) {
    loadEnv({ path: path.resolve(options.env) });
  } else if (fs.existsSync(path.resolve(DEFAULT_ENV_FILE))) {
    loadEnv({ path: path.resolve(DEFAULT_ENV_FILE) });
  } else if (options.configPath && fs.existsSync(path.join(path.dirname(options.configPath), DEFAULT_ENV_FILE))) {
    loadEnv({ path: path.join(path.dirname(options.configPath), DEFAULT_ENV_FILE) });
  }

  let possibleKeys: string[] = ["modelName", "apiKey"];
  if (possibleOptions) {
    possibleKeys = possibleKeys.concat(possibleOptions);
  }

  for (const key of Object.keys(process.env)) {
    const envKey = key.toUpperCase();
    const keyCamelCase = toCamelCase(envKey);
    if (possibleKeys && !possibleKeys.includes(keyCamelCase)) {
      continue;
    }
    if (options[keyCamelCase] === undefined) {
      options[keyCamelCase] = process.env[key];
    }
  }

  if (options.modelName && !options.model) {
    options.model = options.modelName;
  }

  if (options.apiKey && !options.key) {
    options.key = options.apiKey;
  }
}
