# Command line parameters for SVI CLI

## For 'run' command

- -m <model> or --model <model>: LLM model name
- -s <service> or --service <service>: LLM service provider

_Note_ Please refer to this [document](model-and-service-selection.md) to get more information on model and service selection.

- -k <apiKey> or --key <apiKey>: API key for LLM model
- -u <url> or --url <url>: URL of LLM service provider
- -e <path> or --env <path>: Path to the svi.env file if it is located in a different folder than svi.json
- -p <path> or --configPath <path>: Path to the svi.json file if it is located not in the current folder
- -P or --show-prompts: Outputs full prompts to LLM and responses from LLM to the output console for debugging purposes
- l <level> or --loglevel <level>: log level that can be ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE; the default level is INFO.
- h or --help: display the command help information

## For 'init' command

TODO
