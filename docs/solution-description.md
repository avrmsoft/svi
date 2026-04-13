# SVI - Structured Vibe Coding

SVI is a CLI tool that turns structured prompt files into source code — consistently and predictably.

Instead of relying on chat sessions or autonomous agents, you define code generation as version-controlled .svi files — based on Markdown syntax — containing prompts and run them like a build step.

### Why SVI?

- Keep AI-generated code maintainable as your project grows
- Reduce token usage and LLM costs
- Get reproducible results across runs
- Eliminate copy-pasting between chat and your codebase

# The problem

- Coding agents can generate PoCs, MVPs, and small projects within days or even hours instead of weeks or months. However, they struggle with existing codebases, especially when adding new features or working on larger projects.
- Additionally, agents consume a large number of tokens and require powerful LLMs to perform consistently on complex tasks. This leads to high inference costs.
- In most cases, context only exists while the chat session is active. This can be partially mitigated by using `.md` files, but it is still difficult to control how they are used.
- You can gain full control over your code and reduce token usage when working in chat mode, but this requires constant copying between the chat and your source files.

# The solution

SVI replaces ad-hoc prompt usage with a structured, file-based workflow.

Instead of relying on chat sessions or autonomous agents, you define code generation using reusable, version-controlled prompt files that make the process more deterministic.

You control:

- what gets generated
- what context is used
- how your code evolves

No hidden state. No chat history. Just deterministic code generation.

This gives you:

- full control over what is generated and when
- increased reproducibility across runs
- no manual copy-pasting between chat and source code

## A description of the solution

- We split the project into smaller pieces, typically corresponding to individual source code files.
- Each file is generated separately, so the LLM operates within a limited context. You can choose the file size based on the capabilities of the LLM you are using. More powerful (and more expensive) models can handle larger files, while cheaper (or local) models require smaller ones. This is fully configurable.
- Prompts can be included like modules, similar to how includes or imports work in programming languages. This enables modularization and reuse of prompts.

## Why it works

Every LLM requires context to produce consistent results. In large projects, the codebase can contain hundreds of thousands of lines, which is far beyond the practical limits of any LLM.

In this approach, the developer has full control over the context provided to the model. The project is split into parts (source code files), where each file contains isolated logic and references its dependencies.

When a file is generated, the LLM receives:

- the main prompt for file generation
- information about dependencies
- additional reusable prompts, if needed

This approach allows you to use even free or local models by adjusting file size to match model capabilities. More powerful models enable developers to generate larger and more complex files, accelerating development.

Variation is significantly lower than in agent-based approaches because each generation step is strictly limited to a single source code file.

## Our advantages

### Compared to agent-based approaches

- The source of truth is stored in human-readable files rather than generated code; specifications are version-controlled within the project.
- Ability to work with cheaper, free, or local LLMs.
- Lower token consumption due to limited context and caching.
- Higher reproducibility due to constrained context.
- Reduced risk of unexpected changes due to strict scope separation (one specification per file).
- Ability to generate only parts of a project while keeping others untouched.
- Incremental adoption: you don’t need to generate the entire codebase with SVI. You can generate only selected files while keeping the rest of the code handwritten.
- Smooth integration with legacy code: generate new parts without modifying existing ones.
- Built-in caching: generation is skipped if the input prompt has not changed.

### Compared to chat-based workflows

- A structured way to store prompts in a repository with version control.
- Ability to reuse prompts by including them in other prompts.
- No need to copy code back and forth between the editor and chat.
- Support for API key usage.
- Easy integration into CI/CD pipelines.

## Technical description

For a more detailed explanation, see the [technical description of the solution](solution-technical-description.md).
