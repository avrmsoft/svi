import path from "path";
import fs from "fs";
import { config as loadEnv } from "dotenv";
import { DEFAULT_ENV_FILE } from "../utils/constants";
import { toCamelCase } from "../utils/utils.js";
import Logger from "../utils/logger.js";
import { isDirectory } from "../utils/file";
import { get } from "http";

export interface EnvOption {
  key: string;
  description: string;
  exampleValue: string;
}

export const envOptions: EnvOption[] = [
  {
    key: "MODEL_NAME",
    description: "The name of the model to use (e.g., gpt-4, gemini-2.5-flash)",
    exampleValue: "gemini-2.5-flash",
  },
  {
    key: "SERVICE",
    description: "The service provider to use (e.g., google, openai)",
    exampleValue: "google",
  },
  {
    key: "API_KEY",
    description: "The API key for authenticating with the LLM service",
    exampleValue: "123456789abcdef",
  },
  {
    key: "LLM_BASE_URL",
    description:
      "The base URL for the LLM API (useful for custom endpoints or proxies)",
    exampleValue: "http://fake-llm-base-url.com",
  },
];

function getPossibleKeys(): string[] {
  return envOptions.map((option) => option.key);
}

function getPossibleKeysCamelCase(): string[] {
  return envOptions.map((option) => toCamelCase(option.key));
}

export function enrichOptionsFromEnv(options: any, possibleOptions?: string[]) {
  Logger.trace("Enriching options from environment variables");

  tryLoadEnvFromEnvFile(options);

  let possibleKeys: string[] = getPossibleKeysCamelCase();
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

  if (options.llmBaseUrl && !options.url) {
    options.url = options.llmBaseUrl;
  }
}

function tryLoadEnvFromEnvFile(options: any) {
  if (options.env) {
    Logger.debug(
      `Loading environment variables from ${options.env} (set via the corresponding start parameter)`,
    );

    loadEnv({ path: path.resolve(options.env) });
    return;
  } else {
    Logger.trace("No environment file set via start parameter");
  }

  const pathToDefaultEnvFile = path.resolve(DEFAULT_ENV_FILE);
  Logger.trace(
    `Trying to load environment variables from default environment file at ${pathToDefaultEnvFile}`,
  );
  if (fs.existsSync(path.resolve(DEFAULT_ENV_FILE))) {
    Logger.debug(
      `Loading environment variables from default environment file at ${pathToDefaultEnvFile}`,
    );
    loadEnv({ path: path.resolve(DEFAULT_ENV_FILE) });
  } else {
    Logger.trace("No default environment file found");
  }

  if (!options.configPath) {
    Logger.trace(
      "No config path set, therefore we can't load env file from config dir",
    );
    return;
  }

  const pathToEnvFileInConfigDir = path.join(
    path.dirname(options.configPath),
    DEFAULT_ENV_FILE,
  );

  Logger.trace(
    `Trying to load environment variables from environment file in config directory at ${pathToEnvFileInConfigDir}`,
  );

  if (fs.existsSync(pathToEnvFileInConfigDir)) {
    Logger.debug(
      `Loading environment variables from environment file in config directory at ${pathToEnvFileInConfigDir}`,
    );
    loadEnv({
      path: path.join(path.dirname(options.configPath), DEFAULT_ENV_FILE),
    });
    return;
  } else {
    Logger.trace(
      `No environment file found in config directory at path ${pathToEnvFileInConfigDir}`,
    );
  }

  if (isDirectory(options.configPath)) {
    const pathToEnvFileInConfigDir2 = path.join(
      options.configPath,
      DEFAULT_ENV_FILE,
    );

    Logger.trace(
      `The provided config path looks like a directory, trying to load environment file from there at ${pathToEnvFileInConfigDir2}`,
    );

    if (fs.existsSync(pathToEnvFileInConfigDir2)) {
      Logger.debug(
        `Loading environment variables from environment file in config directory at ${pathToEnvFileInConfigDir2}`,
      );
      loadEnv({
        path: pathToEnvFileInConfigDir2,
      });
    } else {
      Logger.trace(
        `No environment file found in config directory at path ${pathToEnvFileInConfigDir2}`,
      );
    }
  }
}

export function getEnvFileExample(): string[] {
  let example: string[] = [".env file example:"];
  for (const option of envOptions) {
    example.push(`# ${option.description}`);
    example.push(`${option.key}=${option.exampleValue}\n`);
  }
  return example;
}

export function printEnvFileExample() {
  const example = getEnvFileExample();
  for (const line of example) {
    Logger.info(line);
  }
}

export function printEnvFileExampleAsError() {
  const example = getEnvFileExample();
  for (const line of example) {
    Logger.error(line);
  }
}
