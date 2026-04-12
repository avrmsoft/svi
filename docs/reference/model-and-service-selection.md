# Model and Service Selection

We aim to support as many LLM providers and models as possible.

To connect to an LLM, you need the following parameters:

- `model_name` — name of the LLM model
- `service` — name of the LLM service, see [the list](supported-llm-services.md). If the required service is not listed, you will need to provide the URL of your service
- `llm_base_url` — URL of the service if it is not known by the library
- `api_key` — API key for your LLM service, which can be omitted if you are using a local LLM

_Note:_ If your service declares OpenAI API compatibility but does not work with the `openai` service configuration, try using it without specifying any service.

Integration with LLMs in this project is powered by [LLM.js](https://github.com/themaximalist/llm.js/). Feel free to refer to its documentation for more information.
