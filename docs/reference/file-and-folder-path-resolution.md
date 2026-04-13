# File and folder path resolution in the SVI project

Paths can be resolved in several different ways:

- Relative path - without preceeding / or \ sign; a private case of relative path is just a filename that means the file with that name in the same folder;

Example:

```bash
folder/file.svi
test.js
```

- Absolute path - a path with preceeding / or \; in windows system it should start with the drive letter

Example:

```bash
C:\\windows\\folder\\filename.svi
/tmp/folder/file.svi
```

- Project-based path - a path relative to the project root, starting with the symbol @project_root

Example:

```bash
@project_root/folder/file.svi
@project_root/main_project_descr.svi
```
