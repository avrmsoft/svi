import { testFile } from "./types.js";

export class FakeFsStatResult {
  private fileName: string;
  private files: testFile[];

  constructor(fileName: string, files: testFile[]) {
    this.fileName = fileName;
    this.files = files;
  }
  public isFile(): boolean {
    const file = this.files.find((f) => f.fullPath === this.fileName);
    return file !== undefined;
  }
  public isDirectory(): boolean {
    const dirPrefix = this.fileName.endsWith("/")
      ? this.fileName
      : this.fileName + "/";
    return this.files.some((f) => f.fullPath.startsWith(dirPrefix));
  }
}
