# SVI - Structured Vibe Coding

<img src="images/svi_logo.png" width="80">

SVI is a CLI tool that turns LLM code generation into a reproducible build step. Use your own AI provider and API key, or generate prompts for manual execution in ChatGPT, Claude, Gemini, and other AI assistants.

<img src="images/svi_demo.gif" width="700">

SVI brings the reliability of traditional build systems to LLM code generation.

Define prompts as Markdown-based `.svi` or `.svi.md` files, version them like source code, and generate consistent outputs — without hidden context, chat history, or guesswork:

1. write `auth.svi`
2. run `svi run`
3. produce a consistent `auth.ts`

`.svi`/`.svi.md` files use a Markdown-like structure, making them easy to read, write, and version control.

Think of `.svi`/`.svi.md` files as source code, and generation as compilation.

## Bring your own AI model

SVI does not provide AI models.

You use your own API key and choose the model and provider that best fit your needs:

- Google Gemini
- OpenAI
- Anthropic Claude
- OpenRouter
- Ollama
- and other providers supported by LLM.js

This gives you full control over costs, privacy, model selection, and rate limits.

### No API key? Use your favorite AI chat

SVI can also generate prompts for manual use.

If you don't have an API key, have reached your daily limits, or prefer using ChatGPT, Claude, Gemini, or another web interface, run:

```bash
svi run -c
```

## No API key? Use your favorite AI chat

SVI can also generate prompts for manual use.

If you don't have an API key, have reached your daily limits, or prefer using ChatGPT, Claude, Gemini, or another web interface, you can:

1. Copy the generated prompt to the clipboard
2. Paste it into your preferred AI chat
3. Copy the response back into SVI

This allows you to keep the same file-based workflow while using any AI service manually.

### Why this matters

AI coding agents are great for prototyping — but often become unreliable in real projects:

- outputs drift over time
- prompts become untraceable
- results depend on implicit context

SVI fixes this by making code generation explicit, versioned, and reproducible.

## Why SVI?

- Enable reproducible AI code generation — the same input produces consistent outputs across runs
- Keep generated code stable and predictable as your project grows
- Reduce token usage by limiting context to explicit dependencies
- Automate generation through APIs when available
- Fall back to copy/paste workflows when API access is unavailable

## Works with existing projects

SVI is designed for incremental adoption.

You don't need to generate your entire codebase with SVI.  
You can use it only for selected files, while the rest of your project remains handwritten.

This makes it easy to introduce SVI into existing projects without disruption.

# The problem

- Agents work well for small projects but become unreliable as codebases grow
- Outputs become inconsistent and hard to trust over time
- High token usage leads to high cost
- Chat-based workflows lack persistent, controllable context

# The solution

SVI introduces a reproducible, file-based workflow for code generation — where each output file is derived from an explicit, version-controlled prompt.

You control:

- what gets generated
- what context is used
- how files depend on each other

No hidden state. No chat history. Just reproducible outputs.

## How it works

- **File-based generation**
  Each file is generated from its own `.svi`/`.svi.md` specification
- **Controlled context size**
  You explicitly define dependencies - smaller prompts, lower cost
- **Prompt modularity**
  Compose prompts like modules
- **Model-aware scaling**
  Use larger files with strong models, and smaller units with weaker ones

# Getting started

## Install

```bash
npm install -g @avrm/svi
```

## Initialize

Create the project configuration file:

```bash
svi init
```

Example `svi.json`:

```json
{
  "programmingLanguage": "TypeScript",
  "searchPaths": ["**/*"],
  "ignorePaths": []
}
```

## Configure environment

`svi.env`

```env
API_KEY=<your API key>
MODEL_NAME=<model name>, e.g., gemini-2.5-flash
SERVICE=<service name>, e.g., google
```

## Write prompts

Create a prompt file:

```bash
svi init hello.svi
```

Example:

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

## Run

Using an API:

```bash
svi run
```

Using ChatGPT, Claude, Gemini, or another AI chat:

```bash
svi run -c
```

Output:

```javascript
// hello.js
function hello() {
  console.log("Hello World");
}
hello();
```

# Documentation

- [Reference](docs/reference/contents.md)
- [Solution Overview](docs/solution-description.md)
- [Technical Details](docs/solution-technical-description.md)
- [`.svi`/`.svi.md` format](docs/reference/svi-file-format.md)
- [Contribution guide](docs/CONTRIBUTION.md)

# Acknowledgement

Thanks to [LLM.js](https://github.com/themaximalist/llm.js/) for multi-model support.
