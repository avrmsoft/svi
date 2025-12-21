# svi

A vibe-coding file-based command line tool that helps you create maintainable projects with the help of AI

# Build package

```bash
cd packages\svi
pnpm build
```

# SVI File Format

File Format

```bash
# Destination File
e.g. code.js
# Input parameters
e.g. class Storage from utils/storage.js
# Output
e.g. class AwesomeAlg, methods doAwesome, doMagic
# Options
ProgrammingLanguage=Node.js
Active=True
# Import prompts
<Paths to other svi files>
# Prompt
```

# Getting started

## Initialize the options

1. Go to the root folder of your project
2. Create the svi.json file by the following command:

```bash
svi init
```

3. File svi.json will be created in the current folder; edit the file if necessary

## Run the code generation

### Recommended way:

1. Create svi.env file in the root directory of your project, with the following content:

```env
API_KEY=<your API key>
MODEL_NAME=<model name>, e.g., gemini-2.5-flash
```

_Note:_ Don't forget to add the .env file to .gitignore

2. Go to the root directory of your project and just run:

```bash
svi
```
