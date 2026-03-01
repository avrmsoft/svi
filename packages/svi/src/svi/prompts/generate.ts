export const generatorPromptTemplate: string = `
Write a code in programming language {{programmingLanguage}}.
Please return only the code, without any explanations, installation manual,
reasoning info, or additional text. Don't add file path in the code,
or if you add it, please add as a commented line.

Please include your code in a code block mark as:
\`\`\`<programming language optional>
<code goes here>
\`\`\`

Generated file path is:
{{destinationFilePath}}.
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
