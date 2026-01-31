export const generatorPromptTemplate: string = `
Write a code in programming language {{programmingLanguage}}.
Please return only the code, without any explanations, installation manual,
or additional text.
The code should fulfill the following requirements:
Declarations that can be used in the written code:
{{dependencies}}

Output parameters:
{{outputParameters}}.

The main specification goes below:
{{mainPrompt}}

Additional context:
{{importedPrompts}}
`;
