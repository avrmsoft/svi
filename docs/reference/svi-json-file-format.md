# Project Configuration File Path

The `svi.json` file is the main configuration file for the SVI CLI. The location of this file defines the root folder of the project.

All `.svi` files must be located either in the same directory as the configuration file or in its subdirectories. You can apply additional filtering for subdirectories using the `searchPaths` and `ignorePaths` parameters (see description below).

## Parameters

- `programmingLanguage` — sets the default programming language for the project.  
  If you need to override this value for a specific file, you can do so in any `.svi` file (see [\*.svi file format](svi-file-format.md) for more details).

- `searchPaths` — an array of paths used to search for `.svi` files.  
  By default, it contains a single entry: `"**/*"`, which includes all files and folders.  
  The search is performed using glob patterns (as supported by the `fast-glob` library).

  Example of restricted search paths:

```json
{
  "programmingLanguage": "node.js",
  "searchPaths": ["correct/**"],
  "ignorePaths": []
}
```

- ignorePaths - an array of paths to exclude from `.svi` file discovery.
  It uses the same glob pattern rules as searchPaths, but matches are excluded instead of included.

_Note_
All paths must be relative to the project root. The project root is the directory containing the main configuration file, usually `svi.json`.
