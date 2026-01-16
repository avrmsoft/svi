import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execa } from "execa";
import { getCliPathTs, getCliPathInDist } from "../testUtils/testUtils";

//const CLI_PATH = getCliPathTs();
const CLI_PATH = getCliPathInDist();

vi.mock("@src/utils/logger.js", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("SVI CLI empty inputs", () => {
  it("should show help message when no input is provided", async () => {
    const { stdout } = await execa("node", [CLI_PATH, "--help"]);
    //const { stdout } = await execa("ts-node", [CLI_PATH, "--help"]);
    expect(stdout).toContain("SVI CLI tool");
    expect(stdout).toContain("Usage:");
    expect(stdout).toContain("init");
    expect(stdout).toContain("run");
  });
});
