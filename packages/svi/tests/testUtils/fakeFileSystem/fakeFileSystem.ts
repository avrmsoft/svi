import { vi } from "vitest";
import fs from "fs";
import path from "path";
//import fg from "fast-glob";
import { convertPathToAbsolute } from "../testUtils";
import { type testFile } from "./types";
import { FakeFsStatResult } from "./fakeFsStatResult";
import FakeFileSystemHelper from "./fakeFileSystemHelper";
import { fastGlobWrapper } from "../../../src/utils/fastGlobWrapper";

/*interface testFile {
  fullPath: string;
  content?: string;
}*/

class fakeFileSystem {
  private files: testFile[] = [];
  private fakeCwd: string = process.cwd();

  public constructor() {
    if (process.platform === "win32") {
      this.setCwd("C:\\temp");
    } else {
      this.setCwd("/tmp");
    }
  }

  public addFile(fullOrRelativePath: string, content?: string): void {
    const fullPath = convertPathToAbsolute(fullOrRelativePath, this.fakeCwd);
    const file: testFile = { fullPath: fullPath, content };
    this.files.push(file);
  }

  public changeFileContent(
    fullOrRelativePath: string,
    newContent: string,
  ): void {
    const fullPath = convertPathToAbsolute(fullOrRelativePath, this.fakeCwd);
    const file = this.files.find((f) => f.fullPath === fullPath);
    if (file) {
      file.content = newContent;
    } else {
      throw new Error(`File not found in mock: ${fullOrRelativePath}`);
    }
  }

  public setCwd(fakePath: string): void {
    this.fakeCwd = fakePath;
  }

  public getCwd(): string {
    return this.fakeCwd;
  }

  private convPath(fullOrRelativePath: string): string {
    const absPath = convertPathToAbsolute(fullOrRelativePath, this.fakeCwd);
    return this.convertToUnixPath(absPath);
  }

  public applyMocks(): void {
    vi.spyOn(process, "cwd").mockImplementation(() => this.fakeCwd);

    vi.spyOn(fs, "existsSync").mockImplementation((filePath: fs.PathLike) => {
      const absPath = this.convPath(filePath.toString());

      // Full equality check
      if (
        this.files.some(
          (f) => this.convPath(f.fullPath) === this.convertToUnixPath(absPath),
        )
      ) {
        return true;
      }

      // A folder containing any of files also exists
      const dirPrefix = absPath.endsWith(path.sep)
        ? absPath
        : absPath + path.sep;
      return this.files.some((f) =>
        this.convPath(f.fullPath).startsWith(dirPrefix),
      );
    });

    vi.spyOn(fs, "readFileSync").mockImplementation(
      (path: fs.PathOrFileDescriptor, options?: any): string => {
        // Path is a descriptor case - don't process for now
        if (typeof path === "number") {
          throw new Error(
            "Mock fs.readFileSync does not support file descriptors",
          );
        }

        const file = this.files.find(
          (f) => this.convPath(f.fullPath) === this.convPath(path.toString()),
        );
        if (!file) {
          throw new Error(`File not found in mock: ${path.toString()}`);
        }

        //return Buffer.from(file.content ?? "", "utf-8");
        return file.content ?? "";
      },
    );

    vi.spyOn(fs, "writeFileSync").mockImplementation(
      (path: fs.PathOrFileDescriptor, data: any, options?: any) => {
        if (typeof path === "number") {
          throw new Error(
            "Mock fs.writeFileSync does not support file descriptors",
          );
        }

        const textData = typeof data === "string" ? data : data.toString();
        const existing = this.files.find(
          (f) => this.convPath(f.fullPath) === this.convPath(path.toString()),
        );
        if (existing) {
          existing.content = textData;
        } else {
          this.files.push({ fullPath: path.toString(), content: textData });
        }
      },
    );

    // --- writeFile (asynchronous) ---
    vi.spyOn(fs, "writeFile").mockImplementation(
      (
        path: fs.PathOrFileDescriptor,
        data: any,
        options: any,
        callback?: (err: NodeJS.ErrnoException | null) => void,
      ): any => {
        // handle optional 'options' parameter
        if (typeof options === "function") {
          callback = options;
          options = undefined;
        }

        try {
          if (typeof path === "number") {
            throw new Error(
              "Mock fs.writeFile does not support file descriptors",
            );
          }

          const textData = typeof data === "string" ? data : data.toString();
          const existing = this.files.find(
            (f) => f.fullPath === path.toString(),
          );
          if (existing) {
            existing.content = textData;
          } else {
            this.addFile(path.toString(), textData);
          }

          callback?.(null); // simulate success
        } catch (err: any) {
          callback?.(err);
        }
      },
    );

    vi.spyOn(fs, "readdirSync").mockImplementation(
      (dirPath: fs.PathLike, options?: any): any => {
        const dirPathAbs = this.convPath(dirPath.toString());
        const prefix = dirPathAbs.replace(/\\/g, "/");
        const filesInDir = this.files
          .map((f) => f.fullPath.replace(/\\/g, "/"))
          .filter((f) => f.startsWith(prefix + "/"));

        // Extract immediate children
        const entries = new Map<string, { name: string; isDir: boolean }>();
        for (const f of filesInDir) {
          const rel = f.substring(prefix.length + 1);
          const firstPart = rel.split("/")[0];
          if (!firstPart) continue;

          const isDir = filesInDir.some((sub) =>
            sub.startsWith(prefix + "/" + firstPart + "/"),
          );
          entries.set(firstPart, { name: firstPart, isDir });
        }

        if (options?.withFileTypes) {
          return Array.from(entries.values()).map((e) => ({
            name: e.name,
            isDirectory: () => e.isDir,
            isFile: () => !e.isDir,
          }));
        }

        return Array.from(entries.keys());
      },
    );

    vi.spyOn(fs.promises, "mkdir").mockImplementation(
      async (dirPath: fs.PathLike, options?: any) => {
        const abs = this.convPath(dirPath.toString());
        // Verzeichnisse simulieren, indem wir sie als "leere Datei mit /" speichern
        const isAlreadyThere = this.files.some(
          (f) =>
            this.convPath(f.fullPath) === abs ||
            this.convPath(f.fullPath).startsWith(abs + path.sep),
        );
        if (!isAlreadyThere) {
          this.files.push({ fullPath: abs, content: undefined });
        }
        // `recursive: true` ignorieren, aber kein Fehler werfen
        return abs;
      },
    );

    vi.spyOn(fs, "statSync").mockImplementation(
      (filePath: fs.PathLike): fs.Stats => {
        const absPath = this.convPath(filePath.toString());
        const fakeStat = new FakeFsStatResult(absPath, this.files);
        return fakeStat as unknown as fs.Stats;
      },
    );

    this.applyMockOnFastGlob();
  }

  public restoreMocks(): void {
    vi.restoreAllMocks();
  }

  public fileContent(fullOrRelativePath: string): string | undefined {
    const file = this.files.find(
      (f) => this.convPath(f.fullPath) === this.convPath(fullOrRelativePath),
    );
    return file?.content;
  }

  public fileExists(fullOrRelativePath: string): boolean {
    return this.files.some(
      (f) => this.convPath(f.fullPath) === this.convPath(fullOrRelativePath),
    );
  }

  private applyMockOnFastGlob(): void {
    vi.spyOn(fastGlobWrapper, "fg").mockImplementation(
      async (
        pattern: string | string[],
        options?: import("fast-glob").Options,
      ): Promise<string[]> => {
        const fsh = new FakeFileSystemHelper(this.files, this.fakeCwd);
        return await fsh.fg(pattern, options);
      },
    );
    /*vi.mock("fast-glob", () => ({
      default: vi.fn(),
    }));

    vi.mocked(fg).mockImplementation(
      async (
        pattern: string | string[],
        options?: fg.Options,
      ): Promise<string[]> => {
        const fsh = new FakeFileSystemHelper(this.files, this.fakeCwd);
        return await fsh.fg(pattern, options);
      },
    );*/
  }

  private convertToUnixPath(fullOrRelativePath: string): string {
    return fullOrRelativePath.replace(/\\/g, "/");
  }
}

export { fakeFileSystem };
