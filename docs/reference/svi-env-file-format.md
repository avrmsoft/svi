# The svi.env file format

The svi.env file is a classical environment file having the following format and parameters:

```bash
MODEL_NAME=
SERVICE=
LLM_BASE_URL=
API_KEY=
```

Parameter description:

- MODEL_NAME - name of LLM model
- SERVICE - name of LLM service
- LLM_BASE_URL - URL of LLM API if it is not the standard URL of the provided for the model and/or service
- API_KEY - cloud LLM model API KEY

For more information on parameters selection please refer to the following [document](model-and-service-selection.md).

If any of parameters is not required in certain case (e.g., no API KEY is needed for local LLMs), it can be ommitted.

For information on how to correctly set service, model, and URL parameters in different cases with examples, please refer to the [Model and Service selection](svi-env-file-format.md) document.
