# Command line parameters for SVI CLI

## For 'init' command

The init command without parameters must be executed once for the new project to creates a new svi.json file in the project root folder.

The init command with filename creates an empty \*.svi file template with all the empty sections.

Also, the following parameters are available:

- -l, --loglevel <level> Set log level (ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE) (default: "INFO")
- -h, --help display help for command

You can also get this information by running:

```bash
svi help init
```

## For 'run' command

The 'run' command is the main command for source code file generation based on prompts in \*.svi files.

- -m <model> or --model <model>: LLM model name
- -s <service> or --service <service>: LLM service provider

_Note_ Please refer to this [document](model-and-service-selection.md) to get more information on model and service selection.

- -k <apiKey> or --key <apiKey>: API key for LLM model
- -u <url> or --url <url>: URL of LLM service provider
- -e <path> or --env <path>: Path to the svi.env file if it is located in a different folder than svi.json
- -p <path> or --configPath <path>: Path to the svi.json file if it is located not in the current folder or has a different name
- -P or --show-prompts: Outputs full prompts to LLM and responses from LLM to the output console for debugging purposes
- l <level> or --loglevel <level>: log level that can be ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE; the default level is INFO.
- h or --help: display the command help information

Also, you can execute the command against certain file(s). In this case, only this single file will be generated instead of the whole project.

Example:

```bash
svi run svifile.svi
```

You can also get this information by running:

```bash
svi help run
```
