import { expect, vi } from "vitest";

let exitSpy: any;

export function mockProcessExit() {
  exitSpy = vi
    .spyOn(process, "exit")
    .mockImplementation((() => undefined) as never);
}

export function checkProcessExitCalledWith(code: number) {
  expect(exitSpy).toHaveBeenCalledWith(code);
}

export function checkProcessExitNotCalled() {
  expect(exitSpy).not.toHaveBeenCalled();
}

export function restoreProcessExit() {
  exitSpy.mockRestore();
}
