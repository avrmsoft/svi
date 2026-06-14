import logger from "../../utils/logger.js";
//import { LLMServiceByModel } from "../../llm/llmServiceByModel";
import { LLMProcessor } from "../../llm/llm";
import { printEnvFileExampleAsError } from "../env";

export default class CheckerForRunManager {
  public static async checkOptions(options: any): Promise<boolean> {
    let isLLMParamsOkay = true;

    if (!options.modelName) {
      logger.error("LLM model name is not specified.");
      logger.error(
        "Please specify the model name in svi.env file in your root directory, or specify another .env file via the -e parameter.",
      );
      logger.error("Env file parameter name is MODEL_NAME");
      logger.error(
        "Also, you can specify the model name via the -m parameter.",
      );
      isLLMParamsOkay = false;
    }

    if (!options.service && options.modelName) {
      logger.debug(
        "Service not specified, trying to determine from model name.",
      );

      const service = await LLMProcessor.getServiceForModel(options.modelName);

      if (service) {
        logger.debug("Determined service: " + service);
      } else {
        logger.error(
          `Could not determine service for model ${options.modelName}, please specify the service explicitly; if unsure, please specify 'openai' as a service`,
        );
        logger.error(
          "Please specify the service name in svi.env file in your root directory, or specify another .env file via the -e parameter.",
        );
        logger.error("Env file parameter name is SERVICE_NAME");
        logger.error(
          "Also, you can specify the service name via the -s parameter.",
        );
        isLLMParamsOkay = false;
      }
    }

    if (!options.apiKey) {
      logger.warn(
        "LLM API key is not specified. Proceeding without an API key.",
      );
    }

    if (!isLLMParamsOkay) {
      printEnvFileExampleAsError();
    }
    /*  logger.error(".env file example:");
      logger.error("MODEL_NAME=your-model-name");
      logger.error("SERVICE_NAME=your-service-name");
      logger.error("API_KEY=your-api-key");
    }*/

    return isLLMParamsOkay;
  }
}
