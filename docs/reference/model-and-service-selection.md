# Model and Service selection

We try to support as much LLM providers and models as we can.
To connect to LLM, you need the following parameters:

- model_name - name of the LLM model;
- service - name of an LLM service, see [the list](supported-llm-services.md). If the needed service is missing in the list, you will need to provide URL of your service;
- llm_base_url - URL of the service if it is not known by the library;
- api_key - API key of your LLM service which can be ommitted if you are using a local LLM.

_Note_: If your service declares OpenAI api support but does not work with the 'openai' service, please try calling it without any service.

The integration with LLMs in our project is powered by the [LLM.js](https://github.com/themaximalist/llm.js/); feel free to refer to its documentation for more information.
