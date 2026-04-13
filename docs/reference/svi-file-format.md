# SVI file format

The `.svi` file format is based on Markdown (`.md`) syntax and uses structured sections to define prompts for code generation.

Each `.svi` file represents a reproducible prompt that is used to generate source code for a specific destination file.

The main goal of this file is to define a clear and structured prompt that produces consistent and predictable code.

```bash
# Destination File
<relative or absolute file path>

# Dependencies
<list of files providing required declarations>

# Output
<define main outputs, e.g. class names, methods, functions, or other objects>

# Options
ProgrammingLanguage=<target programming language (overrides global setting)>
Active=True

# Import prompts
<paths to other .svi files or text files to include>

# Prompt
<main prompt for code generation>
```

Example:

```bash
# Destination File
test.js

# Dependencies
utils/storage.js

# Output
export class SaveTestFile
methods:
* constructor(storage)
* storeFile(fileName, content)
* getFileFromStorage(fileName) -> returns content

# Options
ProgrammingLanguage=JavaScript
Active=True

# Import prompts
mainProjectPrompt.svi

# Prompt
Create a JavaScript class for file manipulation using an external storage class.

Methods:
* constructor — stores the storage instance
* storeFile — writes a file with the given name and content
* getFileFromStorage — returns file content by name

The class should log its activity to the console.
```

# SVI file sections

## Destination

Specifies the path of the file to generate.
Can be a filename, relative path, absolute path, or a path relative to the project root.
See [file and folder path resolution guidelines](file-and-folder-path-resolution.md) for more information.

Optional: if omitted, no file is generated.
The prompt can still be reused via **Import prompts**.

## Dependencies

Lists files whose declarations are required to generate the target file.
Each line represents one source file.
See [file and folder path resolution guidelines](file-and-folder-path-resolution.md) for path resolution rules.

Unlike **Import prompts**, these files are not included directly.
Instead, their declarations are extracted and added to the prompt to reduce token usage.
See [svi file prompt construction](svi-file-prompt-construction.md) for more information.

## Output

Defines stable names for generated entities (e.g. classes, methods).

If omitted, the LLM may generate inconsistent names across runs.
You can also define outputs directly in the main prompt instead.

## Options

Additional configuration for the SVI file.

### ProgrammingLanguage

Specifies the target programming language.

Overrides the [global setting](svi-json-file-format.md) from the main project configuration (e.g. `svi.json`).

_Note_ The programming language name must be understandable by the LLM.
There is no predefined list, but the name should be clear and unambiguous.

### Active

Controls whether the file participates in generation.

- True: included in generation
- False: skipped

_Note_: Inactive files can still be used via **Import prompts**.

## Import prompts

Lists files whose content should be included in the final prompt.

Each line represents one file.

Processing rules:

- `.svi` files: only their Prompt section is included
  (including nested imports)
- other files: full content is included

See [file and folder path resolution guidelines](file-and-folder-path-resolution.md) for more information on path resolution rules.

## Prompt

Contains the main prompt for this file.

- Always included in generation
- Can be reused by other files via Import prompts
