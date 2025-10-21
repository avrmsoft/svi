#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import { runCommand } from "../src/commands/run";
import { initCommand } from "../src/commands/init";
import Logger from "../src/utils/logger";
//import { version } from "../package.json";

const { version } = require("../package.json");
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
  .description("Initialize svi configuration in the current directory or create a new .svi file")
  .action(async (file?: string) => {
    try {
      //const cwd = process.cwd();
      //const targetPath = file ? path.resolve(cwd, file) : cwd;
      const result : number = initCommand(file);
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
 *   svi run -m <model_name> -k <api_key> -e <path_to_env>
 */
program
  .command("run")
  .description("Run the main process based on svi.json and .svi files")
  .option("-m, --model <model>", "Model name for LLM")
  .option("-k, --key <apiKey>", "API key for LLM provider")
  .option("-e, --env <path>", "Path to .env file")
  .action(async (options) => {
    try {
      await runCommand({
        model: options.model,
        apiKey: options.key,
        envPath: options.env,
      });
    } catch (error: any) {
      Logger.error("❌ Run failed:", error.message);
      process.exit(1);
    }
  });

// Parse CLI arguments
program.parse(process.argv);
