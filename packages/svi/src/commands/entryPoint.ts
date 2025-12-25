#!/usr/bin/env node
import { Command } from "commander";
import { runCommand } from "./run.js";
import { initCommand } from "./init.js";
import Logger from "../utils/logger.js";
import { enrichOptionsFromEnv } from "./env.js";
//import { version } from "../package.json";

const { version } = require("../../package.json");

/*import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));
const { version } = pkg;*/

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
program
  .command("init")
  .argument("[file]", "Optional: name of the .svi file to create")
  .option(
    "-l, --loglevel <level>",
    "Set log level (ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE)",
    "INFO"
  )
  .description(
    "Initialize svi configuration in the current directory or create a new .svi file"
  )
  .action(async (options) => {
    enrichOptionsFromEnv(options);
    Logger.setLogLevel(options.loglevel);
    try {
      //const cwd = process.cwd();
      //const targetPath = file ? path.resolve(cwd, file) : cwd;
      const result: number = initCommand(options.file);
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
program
  .command("run")
  .description("Run the main process based on svi.json and .svi files")
  .option("-m, --model <model>", "Model name for LLM")
  .option("-s, --service <service>", "LLM service provider")
  .option("-k, --key <apiKey>", "API key for LLM provider")
  .option("-e, --env <path>", "Path to .env file")
  .option(
    "-l, --loglevel <level>",
    "Set log level (ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE)",
    "INFO"
  )
  .action(async (options) => {
    enrichOptionsFromEnv(options);
    Logger.setLogLevel(options.loglevel);
    try {
      await runCommand({
        model: options.model,
        service: options.service,
        apiKey: options.key,
        envPath: options.env,
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
/*
console.log(import.meta.url);

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}*/
