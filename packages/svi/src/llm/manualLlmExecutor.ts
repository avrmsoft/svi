import clipboard from 'clipboardy';
import readline from 'readline';
import { LLMOptions } from './types';

export default class ManualLlmExecutor {
  constructor(private readonly optionsIn: LLMOptions) {}

  async ask(prompt: string, systemPrompt?: string, promptDescription?: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Automatically copy the prompt to clipboard
    await clipboard.write(prompt);

    console.log("\n--- Manual LLM Interaction Mode ---");
    console.log("The prompt has been automatically copied to your clipboard.");
    console.log("Please follow these steps:");
    console.log( "1. Paste the prompt into your preferred external chat tool (e.g., ChatGPT, Gemini, etc.).", );
    console.log("2. Obtain the LLM response from the chat tool.");
    console.log( "3. Copy ONLY THE RELEVANT CODE SNIPPET (or text) from the LLM response to your clipboard.", );
    console.log("4. Return to this tool and press Enter to continue.");
    console.log( ' (To cancel the operation, type "q" or "quit" and press Enter instead of just Enter.)', );

    const promptText = prompt;

    while (true) {
      const answer = await new Promise<string>((resolve) => {
        rl.question('> ', resolve);
      });

      const trimmedAnswer = answer.trim();
      if (trimmedAnswer.toLowerCase() === 'q' || trimmedAnswer.toLowerCase() === 'quit') {
        rl.close();
        throw new Error('Manual LLM interaction was cancelled by the user.');
      }

      // Wait a brief moment to ensure clipboard updates are flushed
      await sleep(500);
      
      let clipboardContent = '';
      try {
        clipboardContent = await clipboard.read();
      } catch (e) {
        // Ignore errors if clipboardy fails to read
      }

      const trimmedClipboard = clipboardContent ? clipboardContent.trim() : '';

      if (trimmedClipboard === '') {
        console.log('\nClipboard is empty. Please ensure you have copied the response to your clipboard and try again.');
        console.log('(Type "q" or "quit" and press Enter to cancel)');
        continue;
      }

      if (trimmedClipboard === promptText) {
        console.log('\nIt appears you have not copied the new response to your clipboard (it matches the original prompt). Please recopy the response and try again.');
        console.log('(Type "q" or "quit" and press Enter to cancel)');
        continue;
      }

      rl.close();
      return clipboardContent;
    }
  }
}
