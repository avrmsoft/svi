# The `svi.env` File Format

The `svi.env` file is a standard environment file with the following format and parameters:

```bash
MODEL_NAME=
SERVICE=
LLM_BASE_URL=
API_KEY=
```

Parameter description:

- `MODEL_NAME` - name of the LLM model
- `SERVICE` - name of the LLM service
- `LLM_BASE_URL` - URL of the LLM API, used if it differs from the default URL provided for the model and/or service
- `API_KEY` - API key for cloud-based LLM services

For more information about parameter selection, please refer to the following [document](model-and-service-selection.md).

If any parameter is not required in a specific case (e.g., no API key is needed for local LLMs), it can be omitted.

For information on how to correctly configure service, model, and URL parameters in different scenarios with examples, please refer to the [Model and Service selection](svi-env-file-format.md) document.
