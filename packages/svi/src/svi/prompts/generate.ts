export const generatorPromptTemplate: string = `
Write a code in programming language {{programmingLanguage}}.
Please return only the code, without any explanations, installation manual,
or additional text.
Relative file path of the *.svi file is {{sviFilePath}}.
The code should fulfill the following requirements:

The main specification goes below:
{{mainPrompt}}

Output parameters:
{{outputParameters}}.

Declarations that can be used in the written code:
{{dependencies}}

Additional context:
{{importedPrompts}}
`;
