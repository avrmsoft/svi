import { SviFileToLoad } from '../types';
import { checkResults, OneSviCheck } from './types';

// Relative file path: src\svi\sviChecks\checkDestinationPointsToSelf.ts
import SviCheckDestinationPointsToSelf from './checkDestinationPointsToSelf';
// Relative file path: src\svi\sviChecks\checkMultipleLinesInDestination.ts
// Note: The declaration for checkMultipleLinesInDestination.ts exports a class with the same name
// as checkDestinationPointsToSelf.ts. An alias is used to distinguish it during import.
import SviCheckMultipleLinesInDestinationAlias from './checkMultipleLinesInDestination';
// Relative file path: src\svi\sviChecks\checkSeveralSviFilesHaveSameDestination.ts
import SviCheckSeveralFilesHaveSameDestination from './checkSeveralSviFilesHaveSameDestination';

// Assuming 'logger' is available globally or imported from an external logging utility.
// Example: declare const logger: { error: (message: string) => void; };
// For demonstration, a placeholder is used. In a real application, you would
// import your logger instance.
const logger = {
  error: (message: string) => console.error(message),
};

export default class SviChecker {
  private _errors: string[] = [];
  private checks: OneSviCheck[] = [];

  constructor() {
    // Initialize all elementary check classes
    this.checks.push(new SviCheckDestinationPointsToSelf());
    this.checks.push(new SviCheckMultipleLinesInDestinationAlias()); // Use the aliased class
    this.checks.push(new SviCheckSeveralFilesHaveSameDestination());
  }

  public check(sviFilePaths: SviFileToLoad[]): boolean {
    this._errors = []; // Clear previous errors
    let overallIsValid = true;

    for (const checkInstance of this.checks) {
      const checkResult = checkInstance.check(sviFilePaths);
      if (!checkResult.isValid) {
        overallIsValid = false;
        this._errors.push(...checkResult.errors);
      }
    }

    return overallIsValid;
  }

  public logErrors(): void {
    for (const errorMessage of this._errors) {
      logger.error(errorMessage);
    }
  }
}