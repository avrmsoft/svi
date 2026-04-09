# The project configuration file path

The svi.json path is the main configuration file for the svi.cli. The location of this file is considered as the root folder of the project.
All the \*.svi files must be located in the same folder as the configuration file or in subfolders. It is possible to set additional filters on the subfolders of the project folder being search by using parameters 'searchPaths' and 'ignorePaths' (see descriptino below).

Parameters:

- programmingLanguage - you can set the default programming language for the project;
  if you need to change this parameter for certain file, you can override it in any \*.svi file (see [\*.svi file format](svi-file-format.md) for more details).

- searchPaths - an array of paths to search for \*.svi files. By default it contains one element '\*\*\/\*' that means all files and folders.
  The search is performed using glob patterns (as supported by the 'fast-glob' library).
  An example of limited search paths:

```json
{
  "programmingLanguage": "node.js",
  "searchPaths": ["correct/**"],
  "ignorePaths": []
}
```

- ignorePaths - an array of paths to be ignored when searching for \*.svi files. Works by using the same algorithm as the 'searchPaths' parameter, but successful result leads to a file being excluded rather than added.

Note: Paths should be relative to the project root (project root is where the main configuration file, usually svi.json, is located).
