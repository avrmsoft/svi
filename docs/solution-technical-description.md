# The SVI Solution: Technical Description

## Overview of SVI (Structured Vibe Coding)

The main idea behind this solution is to treat your project as a set of isolated parts that work together. Each part is generated independently by the AI, based on other parts. This approach reduces context size and improves reproducibility of inference results.

Each part can have its own specification (prompt). It can include other specifications (other prompts or any additional files can be added to the context, i.e., imported), and it can depend on other parts of the codebase.

## Execution modes

SVI is a come-with-your-API-key tool that supports two execution modes:

### API mode

The prompt is sent directly to the configured LLM provider.

### Manual mode

The generated prompt is copied to the clipboard.
The user submits it to an external AI chat and pastes the response back into SVI.

Both modes use the same prompt construction pipeline.

## Architecture

SVI treats prompt specifications as source code and generated files as build artifacts.

Generation consists of four stages:

1. Dependency resolution
2. Prompt construction
3. LLM execution
4. Output generation

Each generated file is processed independently.
The context for a file is derived only from its specification and explicitly declared dependencies.

## Dependency model

Each .svi file may reference other .svi files.

These references form a dependency graph.

Generation order is determined from this graph.

The tool uses generation order optimization algorithm (dependencies are generated first) and
a protection from going to an infinite loop when circular references are detected.

## Cache invalidation

A cached generation becomes invalid (and is regenerated during the next run) when:

- the .svi file changes

A generation does not automatically become invalid if:

- an imported prompt changes
- a dependency changes
- generation settings change
- the selected model changes

Dependencies in the `# Dependencies` section are generated based on source code and they are also
cached. A dependency cache becomes invalid if the dependency is changed.

This helps to avoid cascade code regenerations when changing some artifacts. To force regeneration
in this case, you can introduce a small change to the corresponding \*.svi file (e.g., add a space),
or delete the generated source code file.

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

Usually, LLM is executed via API. LLM parameters can be read from `svi.env` file in the project root or from any other `.env` file by using parameter `-e`.
Also, a clipboard mode can be activated by using `-c` flag. In this case, each prompt is copied to clipboard,
then CLI expects input from user with LLM response. In this case, no model or API settings are needed, because
users ask LLM and provide the response themselves.

To get more information on CLI parameters, please see [this file](reference/command-line-parameters.md).
