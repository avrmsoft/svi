# SVI File Processing Prompt Construction

When source code must be generated from a `.svi` file, the final prompt is automatically constructed using the prompt defined in the `.svi` file, prompts from imported `.svi` files, and declarations extracted from dependency source code files.

The final prompt consists of the following parts:

- Part 1 — the [system prompt](../../packages/svi/src/svi/prompts/generate.ts)  
  The system prompt contains the main instructions and placeholders, which are replaced with actual data during generation.

- Part 2 — the prompt from the `Prompt` section of the `.svi` file.

- Part 3 — for all files listed in the `Import prompts` section:
  - prompts from the `Prompt` sections of imported `.svi` files
  - contents of non-`.svi` files

- Part 4 — for all files listed in the `Dependencies` section:  
  declarations are extracted from source code files using an additional [prompt](../../packages/svi/src/svi/prompts/extractDeclarations.ts).

  The goal of this extraction is to include only the information necessary to reference these files. In most cases, referencing a source code file requires only its declarations — such as class and method names, type definitions, and function names. The full source code is usually not required in this context.

  The extracted declarations are also included in the final prompt.
