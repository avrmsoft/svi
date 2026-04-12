# The SVI Solution: Technical Description

## Overview of SVI (Structured Vibe Coding)

The main idea behind this solution is to treat your project as a set of isolated parts that work together. Each part is generated independently by the AI, based on other parts. This approach reduces context size and improves reproducibility of inference results.

Each part can have its own specification (prompt). It can include other specifications (other prompts or any additional files can be added to the context, i.e., imported), and it can depend on other parts of the codebase.

## Processing algorithm

### Init command

If the command is executed without a file parameter, a default `svi.json` file is created in the current directory.

If the command is executed with a file parameter, a new `.svi` file template is created with the specified name (or at the specified path, if the parameter includes a path).

### Run command

First, the SVI CLI attempts to locate the project configuration file, typically named `svi.json` (this can be overridden via a parameter).

If the CLI is executed for the entire project (i.e., without specifying particular files for generation), the `svi.json` file must exist in the current directory unless a custom path is explicitly provided using the `-p` parameter.

Once the project file is found, its location is treated as the root directory of the project. By default, all `.svi` files are searched for within this directory. You can customize the search behavior using the `searchPaths` and `ignorePaths` parameters in the [main SVI project configuration file](reference/svi-json-file-format.md).

If the CLI is executed for one or more specific files, the project file may be located not only in the current directory but also in parent directories.

In the next step, all discovered `.svi` files are processed one by one. Before processing, each file is checked against the cache, which is stored in a `.svicache` file in the same directory. If a `.svi` file has not changed since the previous run, it is skipped.

Processing a file consists of the following stages:

- Prompt generation (see [this file](reference/svi-file-prompt-construction.md));
- LLM execution;
- Output file generation;
- Cache update.
