import { SviFileToLoad } from "../types";

export interface checkResults {
  isValid: boolean;
  errors: string[];
}

export interface OneSviCheck {
  check(sviFilePaths: SviFileToLoad[]): checkResults;
}
