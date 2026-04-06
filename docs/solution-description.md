# SVI - A Structured-VIbe coding

A command line tool that compiles text prompts (specifications) into a code.

# A problem we address

A regular agentic approach lets you 'vibe-code' PoCs, MVPs, and small projects within days and even hours instead of weeks and months.
However, when the project grows, each change made by agents is getting more and more flaky. It becomes harder to maintain the project.
Additionally, agents consume many tokens and works good on the most powerful LLM models. This leads to big inference costs.
Another approach is using cheap or even free models for simple code generations in code-completion and chat mode. But this approach often involves copying code between chat and your source code files.
One more consideration is that your context lives while chat is active.
When it is closed, the only place where context is contained is the source code.

# A solution we offer

Unlike ordinary agentic approach, you get more control over your code.
It helps you to create maintainable projects with the help of AI.
Unlike copying-pasting from free chats, you won't need to copy/paste anything. Your prompts will be stored in files and sent automatically to LLM.

## A description of our Solution

- We split our project into smaller pieces generally equal to single source code files;
- Every file is generated separately, and LLM has to work with a limited context. You can choose source code file size accordingly to the quality of LLM you are using. Better (and more expensive) LLM can generate bigger files, and cheaper (or local) LLMs have to work with less files, and you can adjust their size yourself.
- Prompts can be included just like modules and includes in a similar way as you do in programming languages; this way, prompt modularization and reusability is reached.

## Why it works

Each LLM needs context to provide consistent results. When the project is big, its code can contain hundreds of thousands of lines of code, and this context is far from limits of any LLM.
In our solution, developer can have a full control over context which is provided to model. We split our projects into parts (source code files), and each file contains its own separated logic and references other files it depends on (dependencies).
When a file is generated, LLM gets the main prompt for the file generation, information about dependencies, and additional reusable prompts if necessary.
This approach allows using even free and local models by manually adjusting file size to models capabilities. Bigger and stronger models allow developer generate bigger and more complex files thus moving forward faster.
The variation is less than in regular agentic approach because each code generation is strictly limited to only one source code file.

## Our advantages

### Our advantages compared to agentic approach

- The source of truth is contained in human readable files instead of source code; the source specifications are contained in project folder and are subject to version control;
- The possibility to work with cheaper, and even free and local LLMs;
- Less token consumption due to limited context and caching;
- Higher reproducibility of results due to limited context;
- Less probability of unexpected changes due to scope separation (one specification for one source code file);
- The possibility to generate code for part of project, keeping other parts untouched;
- Smooth integration with legacy code; you can generate only new code or separate parts of code keeping other legacy code untouched.

### Our advantages compared to chat-mode

- A convenient way to store prompts, include them to your repository and apply version control on them;
- A convenient way to include one prompts into another thus providing reusability of specifications;
- No need to copy your code to the chat and back, and to combine your prompts from several parts;
- The possibility to use API keys;
- The possibility to work in CI/CD pipelines.
