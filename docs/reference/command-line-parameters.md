# Command-line parameters for SVI CLI

## For the `init` command

The `init` command without parameters must be executed once for a new project. It creates a `svi.json` file in the project root directory.

The `init` command with a filename creates an empty `.svi` file template with all sections included.

The following parameters are available:

- `-l, --loglevel <level>` — Set the log level (ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE). Default: `INFO`
- `-h, --help` — Display help for the command

You can also get this information by running:

```bash
svi help init
```

## For 'run' command

The run command is the main command for generating source code files based on prompts defined in .svi files.

- -m <model>, --model <model> — LLM model name
- -s <service>, --service <service> — LLM service provider

_Note_ Refer to this [document](model-and-service-selection.md) for more information about model and service selection.

- -k <apiKey>, --key <apiKey> — API key for the LLM service
- -u <url>, --url <url> — URL of the LLM service provider
- -e <path>, --env <path> — Path to the svi.env file if it is located outside the project root
- -p <path>, --configPath <path> — Path to the svi.json file if it is not in the current directory or has a different name
- -P, --show-prompts — Output full prompts sent to the LLM and responses received, for debugging purposes
- -l <level>, --loglevel <level> — Set the log level (ERROR, WARN, INFO, SUCCESS, DEBUG, TRACE). Default: INFO
- -h, --help — Display help for the command

You can also execute the command for specific file(s). In this case, only the specified files will be generated instead of the entire project.

Example:

```bash
svi run svifile.svi
```

You can also get this information by running:

```bash
svi help run
```
