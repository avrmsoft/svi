# SVI - A Structured-VIbe coding

A command line tool that compiles text prompts (specifications) into a code.
Want to start right away? Go to the [Getting Started](#getting-started) section.

# The problems we address

- A regular agentic approach lets you 'vibe-code' PoCs, MVPs, and small projects within days and even hours instead of weeks and months.
  However, when the project grows, each change made by agents is getting more and more flaky. It becomes harder to maintain the project.
- Additionally, agents consume many tokens and require the most powerful LLM models to work consistenly on complex tasks. This leads to big inference costs.
- One more consideration is that your context lives while chat is active.
  When it is closed, the only place where context is contained is the source code.
  The approaches such as using MD files for context and other ways of storage try to address this issue, but we cannot be sure which file at which moment will be considered by agent and which won't be.

- Another approach is using cheap or even free models for simple code generations in code-completion and chat mode. But this approach often involves copying code between chat and your source code files.

# A solution we offer

Unlike ordinary agentic approach, you get more control over your code.
It helps you to create maintainable projects with the help of AI.

## A description of our Solution

- We split our project into smaller pieces generally equal to single source code files;
- Every file is generated separately, and LLM has to work with a limited context. You can choose source code file size accordingly to the quality of LLM you are using. Better (and more expensive) LLM can generate bigger files, and cheaper (or local) LLMs have to work with less files, and you can adjust their size yourself.
- Prompts can be included just like modules and includes just like in programming languages; this way, prompt modularization is reached.

## Why it works

Each LLM needs context to provide consistent results. When the project is big, its code can contain hundreds of thousands of lines of code, and this context is far from limits of any LLM.
In our solution, developer can have a full control over context which is provided to model. We split our projects into parts (source code files), and each file contains its own separated logic and references other files it depends on (dependencies).
When a file is generated, LLM gets the main prompt for the file generation, information about dependencies, and additional reusable prompts if necessary.
This approach allows using even free and local models by manually adjusting file size to models capabilities. Bigger and stronger models allow developer generate bigger and more complex files thus moving forward faster.
The variation is less than in regular agentic approach because each code generation is strictly limited to only one source code file.

To get more information on what problems we address and what our advantages are, please refer to [this document](docs\solution-description.md).

# Installation

```bash
npm install -g @avrm/svi
```

# SVI File Format

File Format

```bash
# Destination File
e.g. code.js
# Dependencies
utils/storage.js
# Output
e.g. class AwesomeAlg, methods doAwesome, doMagic
# Options
ProgrammingLanguage=Node.js
Active=True
# Import prompts
<Paths to other svi files>
# Prompt
```

Please refer to [this page](docs\reference\svi-file-format.md) for more information about SVI file format.

# Getting started

## Initialize the options

1. Go to the root folder of your project
2. Create the svi.json file by the following command:

```bash
svi init
```

3. File svi.json will be created in the current folder; edit the file if necessary.
   It is recommended to enter programming language (in any form for LLM to understand).

## Write prompts

Create one or several \*.svi files. You can create these files from scratch or use the following command to create a file template:

```bash
svi init svifile.svi
```

## Run the code generation

1. Create svi.env file in the root directory of your project, with the following content:

```env
API_KEY=<your API key>
MODEL_NAME=<model name>, e.g., gemini-2.5-flash
SERVICE=<service name>, e.g., google
```

_Note:_ Important!!! Don't forget to add the .env file to .gitignore

Please refer to [this file](docs\reference\svi-env-file-format.md) for more information on the svi.env file parameters.

2. Go to the root directory of your project and just run:

```bash
svi run
```

# Getting more information

To review the full technical reference of the solution, please go to [reference contents](docs\reference\contents.md) and choose the necessary chapter.

To get the business solution description, please refer to [this document](docs\solution-description.md).

To get the technical description of the solution, please go to [this document](docs\solution-technical-description.md).

To get information on contribution, please refer to this [document](docs\CONTRIBUTION.md).
