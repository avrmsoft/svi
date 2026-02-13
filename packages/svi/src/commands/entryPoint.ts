#!/usr/bin/env node
import { Command } from "commander";
import { runCommand } from "./run.js";
import { initCommand } from "./init.js";
import Logger from "../utils/logger.js";
import { enrichOptionsFromEnv } from "./env.js";
import { initOptions, runOptions } from "./cliOptions.js";

const { version } = require("../../package.json");

const program = new Command();

program
  .name("svi")
  .description("SVI CLI tool — run and manage .svi configuration files")
  .version(version);

/**
 * Command: init
 * Usage:
 *   svi init                -> create root .svi or svi.json
 *   svi init <filename>     -> create a new .svi file with the given name
 */

let initProg = program
  .command("init")
  .argument("[file]", "Optional: name of the .svi file to create");

for (const option of initOptions) {
  initProg = initProg.option(
    `${option.shortFlag}, ${option.fullFlag}`,
    option.description,
    option.defaultValue,
  );
}

initProg
  .description(
    "Initialize svi configuration in the current directory or create a new .svi file",
  )
  .action(async (file: string | undefined, options) => {
    if (!options) {
      options = {};
    }

    enrichOptionsFromEnv(options);
    Logger.setLogLevel(options.loglevel);
    try {
      const result: number = initCommand(file, options);
      if (result !== 0) {
        Logger.error("❌ Initialization failed");
        process.exit(result);
      }
    } catch (error: any) {
      Logger.error("❌ Initialization failed:", error.message);
      process.exit(1);
    }
  });

/**
 * Command: run
 * Usage:
 *   svi run -m <model_name> -s <service_provider> -k <api_key> -e <path_to_env>
 */
let runProg = program
  .command("run")
  .argument(
    "[files...]",
    "Lets you run for certain .svi file(s) instead of the whole project (via svi.json)",
  )
  .description("Run the main process based on svi.json and .svi files");

for (const option of runOptions) {
  runProg = runProg.option(
    `${option.shortFlag}, ${option.fullFlag}`,
    option.description,
    option.defaultValue,
  );
}

runProg.action(async (files: string[], options) => {
  const possibleOptions: string[] = runOptions.map((opt) => opt.paramName);
  console.log("Options = ", options);
  enrichOptionsFromEnv(options, possibleOptions);
  Logger.setLogLevel(options.loglevel);
  Logger.setShowPrompts(options.showPrompts);
  //console.log(files);
  try {
    await runCommand(files, {
      model: options.model,
      service: options.service,
      apiKey: options.key,
      llmBaseUrl: options.url,
      envPath: options.env,
      sviJsonPath: options.configPath,
    });
  } catch (error: any) {
    Logger.error("❌ Run failed:", error.message);
    process.exit(1);
  }
});

// Parse CLI arguments
export async function runCli(argv = process.argv) {
  await program.parseAsync(argv);
}
