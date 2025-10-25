import { SVIOptionValue } from "../parser/sviParser";

export function optionValueAsString(value: SVIOptionValue): string {
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  return value;
}

export function clearContentFromMarkdownCodeMarkers(content: string): string {
  // Entfernt ```language und ``` aus dem Inhalt
  return content
    .replace(/```[a-zA-Z0-9]*\n/g, "")
    .replace(/```/g, "")
    .trim();
}