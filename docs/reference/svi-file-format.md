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
