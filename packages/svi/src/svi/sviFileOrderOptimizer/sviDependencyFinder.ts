// src/svi/sviFileOrderOptimizer/sviDependencyFinder.ts
import { SVIFile } from "../types";
import { SviDependency } from "./types";

export default class SviDependencyFinder {
  private sviFiles: SVIFile[];
  private foundDependencies: SviDependency[] = [];
  private destinationFileMap: Map<string, SVIFile> = new Map();
  private sviDependencyMap: Map<SVIFile, SviDependency> = new Map();

  constructor(sviFiles: SVIFile[]) {
    this.sviFiles = sviFiles;
  }

  findDependencies(): SviDependencyFinder {
    // Step 1. For each SVIFile it detects target file with SVIFile.getDestinationFileFullPath
    // and stores it in a map for efficient lookup.
    this.destinationFileMap.clear();
    for (const sviFile of this.sviFiles) {
      const destinationFullPath = sviFile.getDestinationFileFullPath();
      if (destinationFullPath) {
        this.destinationFileMap.set(destinationFullPath, sviFile);
      }
    }

    // Step 2. Then it loops through all the svi files, then for each file loops
    // at each file in dependencies (array which is result of SVIFile.getDependenciesFullPaths()),
    // and if a dependency file is among destination files found at step 1, then the source SVIFile
    // for the destination is added to this SVI file dependencies (SviDependency.SviFilesItDependsOn).
    // If no dependencies are found, an empty array is left in the SviDependency interface.
    // The array of SviDependency elements for each of svi files is stored in class attribute.
    this.foundDependencies = [];
    this.sviDependencyMap.clear();

    for (const sourceSviFile of this.sviFiles) {
      const currentSviDependency: SviDependency = {
        SVIFile: sourceSviFile,
        SviFilesItDependsOn: [],
      };

      const declaredDependencies = sourceSviFile.getDependenciesFullPaths();

      for (const declaredDependency of declaredDependencies) {
        const dependentSviFile = this.destinationFileMap.get(declaredDependency.fullPath);
        if (dependentSviFile) {
          currentSviDependency.SviFilesItDependsOn.push(dependentSviFile);
        }
      }
      this.foundDependencies.push(currentSviDependency);
      this.sviDependencyMap.set(sourceSviFile, currentSviDependency);
    }
    return this;
  }

  getFoundDependencies(): SviDependency[] {
    return this.foundDependencies;
  }

  fileDependsOnAnother(sviFile: SVIFile, sviFileItDependsOnOrNot: SVIFile): boolean {
    const dependencyEntry = this.sviDependencyMap.get(sviFile);

    if (!dependencyEntry) {
      return false;
    }

    return dependencyEntry.SviFilesItDependsOn.includes(sviFileItDependsOnOrNot);
  }
}