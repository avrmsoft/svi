# SVI file format

```bash
# Destination File
<relative or absolute file name>
# Dependencies
<a list of file it imports dependencies from>
# Output
<Here you can describe main outputs, e.g., class name(s) and methods, functions,
or other objects>
# Options
ProgrammingLanguage=<programming language if not specified in the main svi.json or is different>
Active=True
# Import prompts
<Paths to other svi files whose prompts you would like to include>
# Prompt
<The main prompt for the code generation>
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
* getFileFromStorage(fileName), returns content
# Options
ProgrammingLanguage=Javascript
Active=True
# Import prompts
mainProjectPrompt.svi
# Prompt
Please create a test java script file for file manipulation by using an external
storage class.
Methods algorithm:
* constructor - Saves storage to class attributes
* storeFile - writes a file with the certain name and content
* getFileFromStorage - returns content of a certain file

The class should log its activities to console
```

# Description of SVI file sections

## Destination

The location of the resulting file that must be generated out of this \*.svi. It can be filename, a relative path, or an absolute path.
The destination file is optional; if omitted, no source code will be generated out of this \*.svi file, but its prompt can be used in another \*.svi files by using the 'import prompts' section.

## Dependencies

This section contains a list of files whose declarations are necessary for successful generation of the destination file.
One line in this section is one source code file.
Unlike files in the 'Import prompts' section, the dependency files are not added to the resulting prompt as is; instead, declarations are extracted from these files by using an additional [prompt](../../packages/svi/src/svi/prompts/generate.ts) and added to the resulting prompt to minimize the context and tokens usage.

## Output

This section may contain declarations from the generated source code to make their name stable. If no output object names are specified, the LLM may generate different names each time.
The desired declarations are not necesserily must be added to this section; they also can be described in the main prompt.

## Options

This section contains additional options.

### ProgrammingLanguage

The programming language name is added to each prompt to tell LLM in which language or using which technology the resulting source code should be generated.
The programming language can be set globally in the [main project file (usually svi.json)](svi-json-file-format.md), but it can be redefined for each \*.svi file by using this parameter.

### Active

The \*.svi file can be switched off from the generation stage by setting the parameter Active=False.

_Note_: Even if a \*.svi file is deactivated, it can still be imported by another \*.svi files via the 'Import prompts' section.

## Import prompts

This section contains a list of other \*.svi files whose content must be added to the final prompt for this file; also, any other file can be included (as a text).
One line in this section is one imported file.

The imported files are processed differently depending on their format:

- If the imported file is an \*.svi file, the contents of its 'Prompt' section is included. If this file also contains files in the 'Import prompts' section, they are also included.
- If the imported file is not an \*.svi file, its contents are completely imported to the final prompt

## Prompt

This section contains the main prompt of the \*.svi file. It is included to the generation prompt for this file without any restrictions. Also, this prompt can be included in the final prompt of another file if it is included via the 'Import prompts' section.
