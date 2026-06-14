# Model and Service Selection

## Parameters description

We aim to support as many LLM providers and models as possible.

To connect to an LLM, you need the following parameters:

- `model_name` — name of the LLM model
- `service` — name of the LLM service, see [the list](supported-llm-services.md). If the required service is not listed, you will need to provide the URL of your service
- `llm_base_url` — URL of the service if it is not known by the library
- `api_key` — API key for your LLM service, which can be omitted if you are using a local LLM

_Note:_ If your service declares OpenAI API compatibility but does not work with the `openai` service configuration, try using it without specifying any service.

Integration with LLMs in this project is powered by [LLM.js](https://github.com/themaximalist/llm.js/). Feel free to refer to its documentation for more information.

## Examples of working parameter combinations

- Gemini 2.5 flash model by Google

```env
MODEL_NAME=gemini-2.5-flash
API_KEY=<Your Google AI Studio API key>
```

- Groq

```env
API_KEY=gsk_<your_groq_api_key>
MODEL_NAME=groq/compound
LLM_BASE_URL=https://api.groq.com/openai/v1
SERVICE=openai
```

- A local model running with Ollama

```env
MODEL_NAME=qwen2.5-coder:7b-instruct-q5_K_M
SERVICE=ollama
```

- A local model running with Ollama by using OpenAI compatible API

```env
LLM_BASE_URL=http://localhost:11434/v1/
MODEL_NAME=qwen2.5-coder:7b-instruct-q5_K_M
SERVICE=openai
```
