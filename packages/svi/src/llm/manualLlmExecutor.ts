import clipboard from "clipboardy";
import * as readline from "readline";

// Relative file path of the *.svi file is src\llm\manualLlmExecutor.svi.
// Generated file path is: src\llm\manualLlmExecutor.ts.
// We need to import from 'src/llm/types' but since this file is also in 'src/llm',
// the relative path should be just './types'.
import { LLMExecutor, LLMOptions } from "./types";

/**
 * Helper function to wait for user input (Enter or specific text).
 * @param message The message to display to the user.
 * @returns A promise that resolves with the trimmed user input.
 */
async function waitForInput(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export default class ManualLlmExecutor implements LLMExecutor {
  constructor(private options?: LLMOptions) {
    // The constructor is provided to match the interface if needed,
    // but the manual executor doesn't strictly use LLMOptions for its core functionality.
  }

  async ask(
    prompt: string,
    systemPrompt?: string,
    promptDescription?: string,
  ): Promise<string> {
    let combinedPrompt = prompt;
    if (systemPrompt) {
      combinedPrompt = `System Prompt:\n${systemPrompt}\n\nUser Prompt:\n${prompt}`;
    }

    // Copy the combined prompt to the clipboard
    await clipboard.write(combinedPrompt);

    console.log("\n--- Manual LLM Interaction Mode ---");
    console.log("The prompt has been automatically copied to your clipboard.");
    console.log("Please follow these steps:");
    console.log(
      "1. Paste the prompt into your preferred external chat tool (e.g., ChatGPT, Gemini, etc.).",
    );
    console.log("2. Obtain the LLM response from the chat tool.");
    console.log(
      "3. Copy ONLY THE RELEVANT CODE SNIPPET (or text) from the LLM response to your clipboard.",
    );
    console.log("4. Return to this tool and press Enter to continue.");
    console.log(
      '   (To cancel the operation, type "q" or "quit" and press Enter instead of just Enter.)',
    );
    console.log("-----------------------------------\n");

    let responseFromClipboard: string = "";
    let attempts = 0;
    const MAX_ATTEMPTS = 3; // Allow user a few retries before aborting

    while (true) {
      const userInput = await waitForInput(
        `[Attempt ${attempts + 1}/${MAX_ATTEMPTS}] Press Enter when you have pasted the content back, or type "q" to quit: `,
      );

      if (
        userInput.toLowerCase() === "q" ||
        userInput.toLowerCase() === "quit"
      ) {
        console.log("\nManual LLM interaction cancelled by user.");
        throw new Error("Manual LLM interaction cancelled by user.");
      }

      responseFromClipboard = await clipboard.read();

      // Check 1: Clipboard is empty
      if (!responseFromClipboard.trim()) {
        console.log("\n--- Warning ---");
        console.log(
          "Your clipboard appears to be empty. No content was found.",
        );
        console.log(
          "Please ensure you have copied the LLM response and try again.",
        );
        console.log("---------------\n");
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          console.log(
            `Maximum attempts (${MAX_ATTEMPTS}) reached. Aborting operation.`,
          );
          throw new Error(
            "Failed to get valid content from clipboard after multiple attempts.",
          );
        }
        continue; // Give the user another chance
      }

      // Check 2: Clipboard content is identical to the initial prompt
      if (responseFromClipboard.trim() === combinedPrompt.trim()) {
        console.log("\n--- Warning ---");
        console.log(
          "The content in your clipboard is identical to the prompt that was initially copied.",
        );
        console.log(
          "It seems you have not copied the LLM response. Please try again.",
        );
        console.log("---------------\n");
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          console.log(
            `Maximum attempts (${MAX_ATTEMPTS}) reached. Aborting operation.`,
          );
          throw new Error(
            "Failed to get a unique response from clipboard after multiple attempts.",
          );
        }
        continue; // Give the user another chance
      }

      // If all checks pass, we have a valid response
      console.log("\nSuccessfully retrieved content from clipboard.");
      break;
    }

    console.log("--- Manual LLM Interaction End ---\n");
    return responseFromClipboard;
  }
}
