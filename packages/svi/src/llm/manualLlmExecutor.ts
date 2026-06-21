import clipboard from 'clipboardy';
import * as readline from 'readline';

// Relative file path of the *.svi file is src\llm\manualLlmExecutor.svi.
// Generated file path is: src\llm\manualLlmExecutor.ts.
// Assuming src/llm/types.ts is in the same directory (src/llm)
import { LLMOptions, LLMExecutor } from './types';

export default class ManualLlmExecutor implements LLMExecutor {
  constructor(private options: LLMOptions) {
    // The constructor takes LLMOptions for consistency with other LLM executors,
    // though many options (like apiKey, llmBaseUrl) are not directly used in this manual mode.
  }

  async ask(
    prompt: string,
    systemPrompt?: string,
    promptDescription?: string,
  ): Promise<string> {
    let fullPromptParts: string[] = [];

    // Construct the full prompt, including system instructions and description if provided
    if (systemPrompt) {
      fullPromptParts.push(`--- System Instructions ---\n${systemPrompt}`);
    }
    if (promptDescription) {
      fullPromptParts.push(`--- Context/Description ---\n${promptDescription}`);
    }
    fullPromptParts.push(`--- User Request ---\n${prompt}`);

    const fullPrompt = fullPromptParts.join('\n\n'); // Join parts with double newline for readability

    // 1. Copy the full prompt to the clipboard and instruct the user
    try {
      await clipboard.write(fullPrompt);
      console.log('----------------------------------------------------');
      console.log('PROMPT COPIED TO CLIPBOARD!');
      console.log('Please paste this prompt into your external chat tool (e.g., ChatGPT, Claude).');
      console.log('----------------------------------------------------');
      console.log('\nOnce you have the response from the chat tool, paste it back here.');
      console.log('To finish pasting the response, press "Enter" twice (once for the last line of the response, and then an empty line to signal completion).');
      console.log('Waiting for your response...');
      console.log('----------------------------------------------------');
    } catch (error) {
      console.error('Failed to copy prompt to clipboard. You may need to install/configure a clipboard tool (e.g., xclip on Linux, or ensure your terminal has clipboard access).');
      console.log('\n----------------------------------------------------');
      console.log('Please manually copy the following prompt:');
      console.log('----------------------------------------------------');
      console.log(fullPrompt);
      console.log('----------------------------------------------------');
      console.log('\nOnce you have the response from the chat tool, paste it back here.');
      console.log('To finish pasting the response, press "Enter" twice (once for the last line of the response, and then an empty line to signal completion).');
      console.log('Waiting for your response...');
      console.log('----------------------------------------------------');
    }

    // 2. Read the pasted response from the user via standard input
    const rl = readline.createInterface({
      input: process.stdin,
      // output: process.stdout is not strictly needed if we only read input, but can be useful for echoing prompts.
      // Setting terminal to false is important for handling multiline pastes without line-by-line echoing.
      terminal: false
    });

    let responseLines: string[] = [];
    let hasContent = false; // Flag to track if any non-empty line has been received

    return new Promise<string>((resolve) => {
      rl.on('line', (line) => {
        if (line.trim() === '') {
          // If an empty line is received *after* some actual content,
          // it signifies the end of the user's input.
          if (hasContent) {
            rl.close(); // Close the readline interface to signal completion
          }
          // If no content has been received yet, ignore leading empty lines.
        } else {
          // This line contains actual content
          hasContent = true;
          responseLines.push(line);
        }
      });

      // 'close' event is emitted when the input stream is closed
      // (e.g., by calling rl.close() or when the input stream ends).
      rl.on('close', () => {
        resolve(responseLines.join('\n'));
      });

      // In case the input stream ends abruptly (e.g., Ctrl+D/Z without an explicit empty line to close rl)
      process.stdin.on('end', () => {
        rl.close();
      });
    });
  }
}