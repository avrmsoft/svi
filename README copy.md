# SVI - Structured-VIbe coding

<img src="images/logo1_cut.png" width="200">

SVI is a CLI tool that turns structured prompt files into source code — consistently and predictably.

Instead of relying on chat sessions or autonomous agents, you define code generation as version-controlled `.svi` files containing prompts and run them like a build step.

### Why SVI?

- Keep AI-generated code maintainable as your project grows
- Reduce token usage and LLM costs
- Get reproducible results across runs
- Eliminate copy-pasting between chat and your codebase

Jump to [Getting Started](#getting-started)

# Problems we address

- Coding agents can generate PoCs, MVPs, and small projects within days or even hours instead of weeks or months. However, agents struggle with existing codebases, especially when adding new features and in larger projects.
- Additionally, agents consume a large number of tokens and require powerful LLMs to work consistently on complex tasks. This leads to high inference costs.
- Generally, your context only exists while the chat is active. This can be partially addressed by using \*.md files, but it is difficult to control how they are used.
- You can gain full control over your code and save tokens when using AI-assisted programming in chat mode, but you will have to copy code between the chat and your source files.

# A solution we offer

SVI replaces ad-hoc prompt usage with a structured, file-based workflow.

Instead of relying on chat sessions or autonomous agents, you define code generation using reusable, version-controlled prompt files that make the process more deterministic.

You control:

- what gets generated
- what context is used
- how your code evolves

No hidden state. No chat history. Just deterministic code generation.

This gives you:

- full control over what is generated and when
- increased reproducibility of results across runs
- no manual copy-pasting between chat and source code

## How it works

SVI introduces a structured approach to AI-assisted development:

- **File-based generation**
  Each source file is generated independently from its own .svi specification. This keeps context small and predictable.
- **Controlled context size**
  You explicitly define dependencies and inputs. This lets you control the context and reduces token usage.
- **Prompt modularity**
  Prompts can be reused similar to modules in programming languages.
- **LLM-aware scaling**
  You can adapt file size and complexity based on the model you use:
  stronger models can process larger files with more complex logic
  weaker/local models can process smaller, more focused units

You can think of prompt files as code, and code generation as a stage in the project compilation process.

# Getting started

## Installation

```bash
npm install -g @avrm/svi
```

## Initialize the options

1. Go to the root folder of your new project
2. Create the svi.json file by the following command:

```bash
svi init
```

3. The svi.json file will be created in the current folder; edit the file if necessary.
   It is recommended to enter programming language (in any form for LLM to understand).

A typical example:

```json
{
  "programmingLanguage": "TypeScript",
  "searchPaths": ["**/*"],
  "ignorePaths": []
}
```

## Write prompts

Create one or several \*.svi files. You can create these files from scratch or use the following command to create a file template:

```bash
svi init svifile.svi
```

An example of a \*.svi file:

```md
# Destination File

hello.js

# Output

function hello()

# Options

ProgrammingLanguage=Node.js
Active=True

# Prompt

Create a function that prints "Hello World", and call this function
```

## Run the code generation

1. Create svi.env file in the root directory of your project, with the following content:

```env
API_KEY=<your API key>
MODEL_NAME=<model name>, e.g., gemini-2.5-flash
SERVICE=<service name>, e.g., google
```

_Note:_ Important!!! Don't forget to add the .env file to .gitignore

Please refer to [this file](docs/reference/svi-env-file-format.md) for more information on the svi.env file parameters.

2. Go to the root directory of your project and run:

```bash
svi run
```

The result should be like this:

```javascript
// hello.js
function hello() {
  console.log("Hello World");
}
hello();
```

# Getting more information

To review the full technical reference of the solution, please go to [reference contents](docs/reference/contents.md) and choose the necessary chapter.

To get the business solution description, please refer to [this document](docs/solution-description.md).

To get the technical description of the solution, please go to [this document](docs/solution-technical-description.md).

To get information about \*.svi file format, please refer to [this document](docs/reference/svi-file-format.md).

To get information on contribution, please refer to this [document](docs/CONTRIBUTION.md).

# Other projects used by SVI

Big thanks to the project [LLM.js](https://github.com/themaximalist/llm.js/) for the great library supporting working with many LLMs out of the box. By using this library, the support of many models has been added to the SVI project.
