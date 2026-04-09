# SVI File Processing Prompt Construction

When a file with source code out of a \*.svi file must be generated, the prompt is automatically constructed based on prompt in the \*.svi file, prompts in the imported \*.svi files, and declarations from dependency source code files.

The final prompt consists of the following parts:

- Part 1 - [system prompt](../../packages/svi/src/svi/prompts/generate.ts).
  System prompt contains the main text and placeholders which are replaced with actual data during the generation.
- Part 2 - a prompt from the 'Prompt' section of the \*.svi file.
- Part 3 - for all the files which are listed in the 'Import prompts' section:
  - prompts from the 'Prompt' sections for \*.svi files;
  - contents of non-svi files.
- Part 4 - for all the files which are listed in the 'Dependencies' section declarations are extracted from source code files with an additional [prompt](../../packages/svi/src/svi/prompts/extractDeclarations.ts).
  The goal of this extraction is to extract only the information that is necessary for referencing to these files. Usually, to reference a source code file, you need its declarations - class and method names, type declaration, function names, etc. The source code itself is usually not important in this case.
  The extracted declarations are also added to the final prompt.
