import { testFile } from "./types.js";

export class FakeFsStatResult {
  private fileName: string;
  private files: testFile[];

  constructor(fileName: string, files: testFile[]) {
    this.fileName = fileName;
    this.files = files;
  }
  public isFile(): boolean {
    const file = this.files.find(
      (f) =>
        this.normalizePath(f.fullPath) === this.normalizePath(this.fileName),
    );
    return file !== undefined && file.content !== undefined;
  }
  public isDirectory(): boolean {
    /*const dirPrefix = this.fileName.endsWith("/")
      ? this.fileName
      : this.fileName + "/";
    return this.files.some((f) => f.fullPath.startsWith(dirPrefix));*/
    const normalized = this.normalizePath(this.fileName);
    const dirPrefix = normalized.endsWith("/") ? normalized : normalized + "/";

    return (
      this.files.some((f) =>
        this.normalizePath(f.fullPath).startsWith(dirPrefix),
      ) ||
      this.files.some(
        (f) =>
          this.normalizePath(f.fullPath) === normalized &&
          f.content === undefined,
      )
    );
  }
  private normalizePath(path: string): string {
    return path.replace(/\\/g, "/");
  }
}
