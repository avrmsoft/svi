import { vi } from "vitest";
import LLM, { Input, Options } from "@themaximalist/llm.js";
import LlmJsFactories from "../../../src/llm/theMaximalistLlmJs/LlmJsFactories";
//import LLMWrapper from "../../../src/llm/theMaximalistLlmJs/LlmJsClassWrapper";

class FakeLlm {
  options: any;
  input: any;
  private benchmarkModel: string = "";
  private benchmarkService: string = "";
  private benchmarkApiKey: string = "";

  constructor(input?: any, options: any = {}) {
    this.input = input;
    this.options = options;

    if (!this.options) {
      this.options = {};
    }

    if (input.apiKey && !options.apiKey) {
      this.options.apiKey = input.apiKey;
    }

    if (input.model && !options.model) {
      this.options.model = input.model;
    }

    if (input.service && !options.service) {
      this.options.service = input.service;
    }
  }

  setBenchmarkOptions(options: any) {
    this.benchmarkModel = options.model;
    this.benchmarkService = options.service;
    this.benchmarkApiKey = options.apiKey;
  }

  async send() {
    if (this.options.model !== this.benchmarkModel) {
      throw new Error(
        `Expected model=${this.benchmarkModel}, got ${this.options.model}`
      );
    }
    if (this.options.apiKey !== this.benchmarkApiKey) {
      throw new Error(
        `Expected apiKey=${this.benchmarkApiKey}, got ${this.options.apiKey}`
      );
    }
    if (
      this.benchmarkService &&
      this.options.service !== this.benchmarkService
    ) {
      throw new Error(
        `Expected service=${this.benchmarkService}, got ${this.options.service}`
      );
    } else if (!this.options.service) {
      throw new Error("Expected service to be defined and not empty");
    }
    const systemPrompt = this.input.messages.find(
      (m: any) => m.role === "system"
    )?.content;
    const userPrompt = this.input.messages.find(
      (m: any) => m.role === "user"
    )?.content;

    return `Fake LLM answer for system prompt = ${systemPrompt}, user prompt = ${userPrompt}`;
  }

  addMessage(role: string, content: any) {
    if (this.input.messages === undefined) {
      this.input.messages = [];
    }
    this.input.messages.push({ role, content });
  }

  user(content: string) {
    this.addMessage("user", content);
  }

  system(content: string) {
    this.addMessage("system", content);
  }
}

export function enableFakeMaximalistLLMJsLLM(requiredOptions: {
  model?: string;
  apiKey?: string;
  service?: string;
}) {
  vi.spyOn(LlmJsFactories, "createLlm").mockImplementation(
    (input?: Input | Options, options: Options = {}) => {
      const fake = new FakeLlm(input, options);
      fake.setBenchmarkOptions(requiredOptions);
      return fake as unknown as InstanceType<typeof LLM>;
    }
  );

  /*const mockFn = vi
    .fn()
    .mockImplementation((input?: any, options: any = {}) => {
      const fake = new FakeLlm(input || { messages: [] }, options);
      fake.setBenchmarkOptions(requiredOptions);
      return fake;
    });

  createLlm = mockFn;*/

  /*vi.mock("../../../src/llm/theMaximalistLlmJs/LlmJsClassWrapper", async () => {
    const mod = await vi.importActual<any>(
      "../../../src/llm/theMaximalistLlmJs/LlmJsClassWrapper"
    );

    return {
      __esModule: true,
      default: class LLMWrapper {
        private fake: any;

        constructor(input?: any, options: any = {}) {
          this.fake = new FakeLlm(input || { messages: [] }, options);
          this.fake.setBenchmarkOptions(requiredOptions);
          return this.fake;
        }
      },
    };
  });*/
}

export function disableFakeMaximalistLLMJsLLM() {
  vi.unmock("../../../src/llm/theMaximalistLlmJs/LlmJsClassWrapper");
}
