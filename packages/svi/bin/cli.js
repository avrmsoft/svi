#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const run_1 = require("../src/commands/run");
const init_1 = require("../src/commands/init");
const package_json_1 = require("../package.json");
const program = new commander_1.Command();
program
    .name("svi")
    .description("SVI CLI tool — run and manage .svi configuration files")
    .version(package_json_1.version);
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
    .action((file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cwd = process.cwd();
        const targetPath = file ? path_1.default.resolve(cwd, file) : cwd;
        yield (0, init_1.initCommand)(targetPath);
    }
    catch (error) {
        console.error("❌ Initialization failed:", error.message);
        process.exit(1);
    }
}));
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
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, run_1.runCommand)({
            model: options.model,
            apiKey: options.key,
            envPath: options.env,
        });
    }
    catch (error) {
        console.error("❌ Run failed:", error.message);
        process.exit(1);
    }
}));
// Parse CLI arguments
program.parse(process.argv);
