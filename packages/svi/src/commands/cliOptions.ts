export interface CliOption {
  shortFlag: string;
  fullFlag: string;
  description: string;
  defaultValue?: string;
  paramName: string;
}

export const initOptions: CliOption[] = [
  {
    shortFlag: "-l",
    fullFlag: "--loglevel <level>",
    description: "Set log level (ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE)",
    defaultValue: "INFO",
    paramName: "level",
  },
];

export const runOptions: CliOption[] = [
  {
    shortFlag: "-m",
    fullFlag: "--model <model>",
    description: "Model name for LLM",
    paramName: "model",
  },
  {
    shortFlag: "-s",
    fullFlag: "--service <service>",
    description: "LLM service provider",
    paramName: "service",
  },
  {
    shortFlag: "-k",
    fullFlag: "--key <apiKey>",
    description: "API key for LLM provider",
    paramName: "key",
  },
  {
    shortFlag: "-u",
    fullFlag: "--url <baseUrl>",
    description: "Base URL for LLM provider",
    paramName: "baseUrl",
  },
  {
    shortFlag: "-e",
    fullFlag: "--env <path>",
    description: "Path to .env file",
    paramName: "env",
  },

  {
    shortFlag: "-p",
    fullFlag: "--configPath <svi.json path>",
    description: "Path to svi.json file",
    paramName: "configPath",
  },
  {
    shortFlag: "-P",
    fullFlag: "--show-prompts",
    description: "Output LLM prompts and responses in console output",
    paramName: "showPrompts",
  },
  ...initOptions,
];
