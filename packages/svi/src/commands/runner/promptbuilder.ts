// src/commands/runner/promptBuilder.ts
import { SVIFile } from './../../parser/sviParser';

/**
 * Baut den finalen Prompt-Text aus einer SVI-Datei.
 * @param svi Die SVI-Datei in geparster Form.
 * @returns Den fertigen Prompt-String für das LLM.
 */
export function buildPrompt(svi: SVIFile): string {
    // Programming Language aus Optionen holen, Standard auf 'Node.js'
    const programmingLanguage = svi.options?.ProgrammingLanguage || 'Node.js';

    // Input-Parameter und Output-Parameter formatieren
    const inputParams = svi.inputParameters && svi.inputParameters.length > 0
        ? `Input parameters: ${svi.inputParameters.join(', ')}.`
        : '';

    const outputParams = svi.output && svi.output.length > 0
        ? `Output parameters: ${svi.output.join(', ')}.`
        : '';

    // Prompt aus #Prompt Abschnitt
    const mainPrompt = svi.prompt || '';

    // Import Prompts
    const importPrompts = svi.importPrompts && svi.importPrompts.length > 0
        ? svi.importPrompts.join('\n')
        : '';

    // Zusammenbauen des finalen Prompt-Texts
    const finalPrompt = `
Create a program in ${programmingLanguage} according to the following:
${inputParams}
${outputParams}
${mainPrompt}
${importPrompts}
`;

    return finalPrompt.trim();
}
