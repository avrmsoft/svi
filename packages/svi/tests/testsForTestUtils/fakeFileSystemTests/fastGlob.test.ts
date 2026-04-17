import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeFileSystem } from "../../testUtils/fakeFileSystem/fakeFileSystem";
import { fastGlobWrapper } from "../../../src/utils/fastGlobWrapper";
import {
  convertPathToAbsolute,
  convertToUnixPath,
} from "../../testUtils/testUtils";
import fs from "fs";
import path from "path";

describe("Main fake FS tests", () => {
  let fakeFs: fakeFileSystem;

  beforeEach(() => {
    fakeFs = new fakeFileSystem();
    fakeFs.applyMocks();
  });

  afterEach(() => {
    fakeFs.restoreMocks();
    vi.clearAllMocks();
  });

  it("Mocked fast-glob sees files added in the fake file system", async () => {
    fakeFs.addFile("globbed.svi", "Globbed content");
    fs.writeFileSync(
      path.join(fakeFs.getCwd(), "anotherGlobbed.svi"),
      "Another globbed content",
    );

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    const resultsUnix = results.map((r) => convertToUnixPath(r));

    let aPath = convertPathToAbsolute("globbed.svi", fakeFs.getCwd());
    aPath = convertToUnixPath(aPath);
    expect(resultsUnix).toContain(aPath);

    let anotherPath = convertPathToAbsolute(
      "anotherGlobbed.svi",
      fakeFs.getCwd(),
    );
    anotherPath = convertToUnixPath(anotherPath);
    expect(resultsUnix).toContain(anotherPath);
  });

  it("In subfolders", async () => {
    fakeFs.addFile("subfolder/file1.svi", "File 1 content");
    fs.writeFileSync(
      path.join(fakeFs.getCwd() + "/folder", "anotherGlobbed.svi"),
      "Another globbed content",
    );

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    const resultsUnix = results.map((r) => convertToUnixPath(r));

    let aPath = convertPathToAbsolute("subfolder/file1.svi", fakeFs.getCwd());
    aPath = convertToUnixPath(aPath);

    expect(resultsUnix).toContain(aPath);

    let anotherPath = convertPathToAbsolute(
      "folder/anotherGlobbed.svi",
      fakeFs.getCwd(),
    );
    anotherPath = convertToUnixPath(anotherPath);
    expect(resultsUnix).toContain(anotherPath);
  });

  it("Unix style paths", async () => {
    fakeFs.setCwd("/fake/cwd");
    fakeFs.addFile("unixStyle.svi", "Unix style content");
    fs.writeFileSync(
      "/fake/cwd/anotherUnixStyle.svi",
      "Another unix style content",
    );

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    const resultsUnix = results.map((r) => convertToUnixPath(r));

    let aPath = convertPathToAbsolute("unixStyle.svi", fakeFs.getCwd());
    aPath = convertToUnixPath(aPath);
    expect(resultsUnix).toContain(aPath);

    let anotherPath = convertPathToAbsolute(
      "anotherUnixStyle.svi",
      fakeFs.getCwd(),
    );
    anotherPath = convertToUnixPath(anotherPath);
    expect(resultsUnix).toContain(anotherPath);
  });

  it("In root and in subfolders", async () => {
    fakeFs.setCwd("C:\\test");
    fakeFs.addFile("inRoot.svi", "File in root content");
    fakeFs.addFile("subfolder\\inSubfolder.svi", "File in subfolder content");

    const results = await fastGlobWrapper.fg("**/*", {
      cwd: fakeFs.getCwd(),
      absolute: true,
    });

    const resultsUnix = results.map((r) => convertToUnixPath(r));

    let aPath = convertPathToAbsolute("inRoot.svi", fakeFs.getCwd());
    aPath = convertToUnixPath(aPath);
    expect(resultsUnix).toContain(aPath);

    let anotherPath = convertPathToAbsolute(
      "subfolder/inSubfolder.svi",
      fakeFs.getCwd(),
    );
    anotherPath = convertToUnixPath(anotherPath);
    expect(resultsUnix).toContain(anotherPath);
  });
});
