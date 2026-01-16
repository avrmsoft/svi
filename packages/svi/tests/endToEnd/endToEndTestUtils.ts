import { fakeFileSystem } from "../testUtils/fakeFileSystem/fakeFileSystem";
import fakeLogger from "../testUtils/fakeLogger";
import { vi } from "vitest";
import { pushProcessEnv, popProcessEnv } from "../testUtils/testUtils";

export function beforeEachEndToEndTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger
) {
  pushProcessEnv();
  fakeFs.applyMocks();
  if (fakeLogger) {
    fakeLogger.applyMocks();
  }
}

export function afterEachEndToEndTest(
  fakeFs: fakeFileSystem,
  fakeLogger?: fakeLogger
) {
  popProcessEnv();
  fakeFs.restoreMocks();
  vi.clearAllMocks();
  if (fakeLogger) {
    fakeLogger.disableMocks();
  }
}
