export function prepareApiKeyForLogs(
  apiKey: string | null | undefined
): string {
  if (!apiKey) {
    return "null";
  } else if (apiKey.length < 8) {
    return "****";
  }
  return apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length - 4);
}

export function preparePromptForLogs(prompt: string): string {
  if (!prompt) {
    return "null";
  } else if (prompt.length <= 20) {
    return prompt;
  }
  return (
    prompt.substring(0, 10) + "...." + prompt.substring(prompt.length - 10)
  );
}
