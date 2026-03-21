import { SVIFile, SviFileToLoad, ImportPromptPath } from "../types";
import { SviDependency } from "./types";
import SviDependencyFinder from "./sviDependencyFinder";
import SviDependencyCycleAnalyzer from "./sviDependencyCycleAnalyzer"; // Assuming class name is SviDependencyCycleAnalyzer

export default class SviFileOrderOptimizer {
  private sviFiles: SVIFile[];
  private optimizedResult: SviFileToLoad[] | null = null;

  constructor(sviFiles: SVIFile[]) {
    this.sviFiles = sviFiles;
  }

  computeOptimizedOrder(): SviFileOrderOptimizer {
    // 1. Run SviDependencyFinder class to get an array of dependencies
    const dependencyFinder = new SviDependencyFinder(this.sviFiles);
    dependencyFinder.findDependencies();
    const dependencies = dependencyFinder.getFoundDependencies();

    // 2. Create an instance of SviDependencyCycleAnalyzer class and run
    // the findCycles method to prepare for other methods calls.
    const cycleAnalyzer = new SviDependencyCycleAnalyzer(dependencies);
    cycleAnalyzer.findCycles();

    let swappedOverall: boolean;
    // Store full paths of files identified for preliminary generation
    const preliminarySviFilesSet = new Set<string>();
    // Create a mutable copy of the initial sviFiles array to optimize its order
    const currentOptimizedOrder = [...this.sviFiles];

    // 7. If after all loops at least one swap has been done, then repeat these loops.
    // This do-while loop ensures the entire sorting process is repeated as long as swaps occur.
    do {
      swappedOverall = false; // Reset for each full pass of the sorting algorithm
      // 3. Loop at every svi file in the initial sviFiles array, current file is sviFile1
      for (let i = 0; i < currentOptimizedOrder.length; i++) {
        // 4. In each iteration, loop at all files starting from the next after the current
        // till the last one, let it be sviFile2
        for (let j = i + 1; j < currentOptimizedOrder.length; j++) {
          const sviFile1 = currentOptimizedOrder[i];
          const sviFile2 = currentOptimizedOrder[j];

          // 5. For each pair of sviFile1 and sviFile2 use the result of
          // SviDependencyFinder to check if sviFile1 depends on sviFile2
          if (dependencyFinder.fileDependsOnAnother(sviFile1, sviFile2)) {
            // 6. If it is true, then check if sviFile1 and sviFile2 are both in a dependency cycle
            // by calling SviDependencyCycleAnalyzer.isFileInCycle and if it is the case then
            // check if they are in the same cycle by calling
            // SviDependencyCycleAnalyzer.areFilesInTheSameCycle.
            const isFile1InCycle = cycleAnalyzer.isFileInCycle(sviFile1);
            const isFile2InCycle = cycleAnalyzer.isFileInCycle(sviFile2);

            if (isFile1InCycle && isFile2InCycle && cycleAnalyzer.areFilesInTheSameCycle(sviFile1, sviFile2)) {
              // If true, then add this file to a separate array of files that need a preliminary generation
              preliminarySviFilesSet.add(sviFile1.getSviFileFullPath());
              preliminarySviFilesSet.add(sviFile2.getSviFileFullPath());
            } else {
              // If false (i.e., dependency exists but not in the same cycle, or not in a cycle),
              // then swap sviFile1 and sviFile2 in the list of svi files.
              [currentOptimizedOrder[i], currentOptimizedOrder[j]] = [currentOptimizedOrder[j], currentOptimizedOrder[i]];
              swappedOverall = true;
              // A swap occurred, which means the order has changed.
              // The algorithm requires repeating "these loops" if any swap has been done.
              // To achieve this, we break out of the current nested loops and let the do-while
              // condition re-start the entire iteration from the beginning of the `currentOptimizedOrder`.
              i = currentOptimizedOrder.length; // Force the outer loop to terminate
              break; // Break the inner loop
            }
          }
        }
      }
    } while (swappedOverall); // Repeat as long as swaps were made in the last full pass

    // 7. If not [swapped], then add the unique list in preliminarySviFiles array in the beginning with
    // flag isPreliminary to the result or type SviFileToLoad[].
    // 8. Save the result
    this.optimizedResult = [];

    // Add unique preliminary files first with isPreliminary: true
    for (const preliminaryFilePath of preliminarySviFilesSet) {
      this.optimizedResult.push({ filePath: preliminaryFilePath, isPreliminary: true });
    }

    // Then, add all files from the final optimized order as non-preliminary.
    // Files that were identified as preliminary will appear again here, as required
    // ("If the file is created with a preliminary version, it must be in the array again later
    // to be regenerated in the final version.").
    for (const sviFile of currentOptimizedOrder) {
      this.optimizedResult.push({ filePath: sviFile.getSviFileFullPath(), isPreliminary: false });
    }

    return this;
  }

  getOptimizedFiles(): SviFileToLoad[] {
    if (this.optimizedResult === null) {
      throw new Error("computeOptimizedOrder must be called before getOptimizedFiles to compute the order.");
    }
    return this.optimizedResult;
  }
}