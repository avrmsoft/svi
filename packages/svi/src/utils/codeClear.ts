// src/utils/codeClear.ts
export function clearCodeInLlmResponse(llmResponse: string): string {
  const lines = llmResponse.split("\n");
  const extractedCodeLines: string[] = [];
  let inCodeBlock = false;
  let foundAnyCodeBlocks = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("\`\`\`")) {
      inCodeBlock = !inCodeBlock;
      foundAnyCodeBlocks = true;
      // Do not include the markdown code block markers in the extracted content
      continue;
    }

    if (inCodeBlock) {
      extractedCodeLines.push(line);
    }
  }

  if (foundAnyCodeBlocks) {
    return extractedCodeLines.join("\n");
  } else {
    return llmResponse;
  }
}
