export const extractDeclarationsPromptTemplate: string = `
Below is a file with a source code {{programmingLanguage}}.
Your task is to extract all declarations from the code
(functions, classes, interfaces, enums, etc. depending on programming language).

Please return only the extracted declarations, without any implementations,
explanations, or additional text.
Return all the information about declarations that can be useful for writing
referencing files: class/interface names, method/function signatures, 
types, constants, etc.
The extracted information should not be a syntaxically correct code, 
but should contain all necessary details to understand how to use
the declared entities.

The code is as follows:
----------------------------------
{{sourceCode}}
`;
