import { expect } from "vitest";
import { fakeFileSystem } from "../../../testUtils/fakeFileSystem/fakeFileSystem";

export function addSviFile(
  fakeFs: fakeFileSystem,
  sviFilename: string,
  destFilename: string,
  prompt: string,
) {
  fakeFs.addFile(
    `${sviFilename}`,
    `
# Destination File
${destFilename}
# Input parameters
# Output
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
# Prompt
${prompt}
`,
  );
}

export function checkGenerationWorked(
  fakeFs: fakeFileSystem,
  destFile: string,
  checkPrompt: string,
) {
  expect(fakeFs.fileExists(destFile)).toBe(true);
  const content = fakeFs.fileContent(destFile);
  expect(content).toContain(checkPrompt);
}

export function checkGenerationNotWorked(
  fakeFs: fakeFileSystem,
  destFile: string,
) {
  expect(fakeFs.fileExists(destFile)).toBe(false);
}
