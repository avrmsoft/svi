export const generatorPromptTemplate : string = `
Write a code in programming language {{programmingLanguage}}.
Please return only the code, without any explanations, installation manual,
or additional text.
The code should fulfill the following requirements:
Input parameters: {{inputParameters}}.
Output parameters: {{outputParameters}}.

The main specification goes below:
{{mainPrompt}}

Additional context:
{{importedPrompts}}
`;