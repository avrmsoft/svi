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

Declarations from external files that are dependencies of the generated file 
and can be useful for writing the code.
Note!!! Please don't redeclare them in the generated code; instead,
import/include etc them from source files using programming language syntax!!!
{{dependencies}}
--- End of declarations from dependencies ---

Additional context:
{{importedPrompts}}
`;
