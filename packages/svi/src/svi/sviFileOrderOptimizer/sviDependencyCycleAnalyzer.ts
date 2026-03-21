import { SVIFile, SviFileToLoad, ImportPromptPath } from "../types";
import { SviDependency } from "./types";

// Type alias for DFS node states
type NodeState = 0 | 1 | 2; // 0: unvisited, 1: visiting (in current recursion stack), 2: visited (finished processing)

export default class SviDependencyCycleAnalyzer {
  private _sviDependencies: SviDependency[];
  // Adjacency list: SVIFileFullPath -> array of SVIFileFullPaths it depends on
  private _graph: Map<string, string[]>;
  // Map from SVIFileFullPath to the actual SVIFile object
  private _fileMap: Map<string, SVIFile>;

  // Stores an array of cycles, where each cycle is an array of SVIFile objects
  private _cycles: SVIFile[][];
  // Maps SVIFileFullPath to a set of indices of cycles it belongs to within _cycles array
  private _fileToCyclesMap: Map<string, Set<number>>;

  constructor(sviDependencies: SviDependency[]) {
    this._sviDependencies = sviDependencies;
    this._graph = new Map();
    this._fileMap = new Map();
    this._cycles = [];
    this._fileToCyclesMap = new Map();
  }

  /**
   * Analyzes the sviDependencies[] array to detect dependency cycles.
   * This method populates internal structures used by `isFileInCycle` and `areFilesInTheSameCycle`.
   */
  findCycles(): void {
    this._buildGraph(); // Construct the graph representation
    this._cycles = []; // Reset detected cycles
    this._fileToCyclesMap = new Map(); // Reset map for file-to-cycle associations

    const states: Map<string, NodeState> = new Map(); // Stores the DFS state for each node
    const path: string[] = []; // Stores the current path in the DFS traversal

    // Initialize all nodes (files) as unvisited
    for (const fileFullPath of this._fileMap.keys()) {
      states.set(fileFullPath, 0);
    }

    // Iterate over all files to ensure that all connected components of the graph are visited
    // This allows detection of cycles in disconnected parts of the dependency graph.
    for (const fileFullPath of this._fileMap.keys()) {
      if (states.get(fileFullPath) === 0) {
        this._dfs(fileFullPath, states, path);
      }
    }
  }

  /**
   * Recursive Depth-First Search (DFS) function to detect cycles.
   * @param currentFileFullPath The full path of the SVIFile currently being visited.
   * @param states A map tracking the state (unvisited, visiting, visited) of each node.
   * @param path An array representing the current recursion path, used to reconstruct cycles.
   */
  private _dfs(
    currentFileFullPath: string,
    states: Map<string, NodeState>,
    path: string[]
  ): void {
    states.set(currentFileFullPath, 1); // Mark current node as 'visiting' (in recursion stack)
    path.push(currentFileFullPath); // Add current node to the current path

    const dependencies = this._graph.get(currentFileFullPath) || [];

    for (const dependentFileFullPath of dependencies) {
      if (states.get(dependentFileFullPath) === 0) {
        // Neighbor is unvisited, continue DFS
        this._dfs(dependentFileFullPath, states, path);
      } else if (states.get(dependentFileFullPath) === 1) {
        // Neighbor is 'visiting', meaning it's already in the current recursion stack.
        // This indicates a back-edge and thus a cycle.
        this._handleCycleDetection(dependentFileFullPath, path);
      }
      // If state is 2 (visited), ignore it as it's already processed and won't lead to new cycles from this path.
    }

    path.pop(); // Remove current node from path (backtrack)
    states.set(currentFileFullPath, 2); // Mark current node as 'visited' (finished processing)
  }

  /**
   * Extracts and stores a detected cycle.
   * @param cycleStartFileFullPath The full path of the file where the cycle begins (the node that was 'visiting').
   * @param currentPath The current DFS path, from which the cycle will be extracted.
   */
  private _handleCycleDetection(cycleStartFileFullPath: string, currentPath: string[]): void {
    const cycleStartIndex = currentPath.indexOf(cycleStartFileFullPath);
    if (cycleStartIndex === -1) {
      // This scenario should ideally not occur if the DFS logic is correct.
      return;
    }

    // Extract the file paths that form the cycle from the current DFS path.
    const cycleFilePaths = currentPath.slice(cycleStartIndex);
    const newCycle: SVIFile[] = [];

    // Convert file paths back to SVIFile objects for storage.
    for (const filePath of cycleFilePaths) {
      const sviFile = this._fileMap.get(filePath);
      if (sviFile) {
        newCycle.push(sviFile);
      }
    }

    if (newCycle.length > 0) {
      const cycleIndex = this._cycles.length; // Assign a unique index to the new cycle
      this._cycles.push(newCycle); // Store the cycle

      // Update the mapping from each file in the cycle to its corresponding cycle index.
      for (const fileInCycle of newCycle) {
        const fileFullPath = fileInCycle.getSviFileFullPath();
        if (!this._fileToCyclesMap.has(fileFullPath)) {
          this._fileToCyclesMap.set(fileFullPath, new Set());
        }
        this._fileToCyclesMap.get(fileFullPath)?.add(cycleIndex);
      }
    }
  }

  /**
   * Builds the graph representation (adjacency list) and the file map from the provided SviDependency array.
   * This prepares the data for the cycle detection algorithm.
   */
  private _buildGraph(): void {
    this._graph.clear();
    this._fileMap.clear();

    for (const dep of this._sviDependencies) {
      const currentFileFullPath = dep.SVIFile.getSviFileFullPath();
      this._fileMap.set(currentFileFullPath, dep.SVIFile);

      // Ensure an entry exists for the current file in the graph, even if it has no dependencies.
      if (!this._graph.has(currentFileFullPath)) {
        this._graph.set(currentFileFullPath, []);
      }

      for (const dependentFile of dep.SviFilesItDependsOn) {
        const dependentFileFullPath = dependentFile.getSviFileFullPath();
        // Add the dependent file to the file map, in case it hasn't been added as a primary SVIFile yet.
        this._fileMap.set(dependentFileFullPath, dependentFile);
        // Add the dependency to the graph's adjacency list.
        this._graph.get(currentFileFullPath)?.push(dependentFileFullPath);
      }
    }
  }

  /**
   * Checks if a given SVIFile is part of at least one dependency cycle.
   * @param sviFile The SVIFile to check.
   * @returns True if the file is contained in any cycle, false otherwise.
   */
  isFileInCycle(sviFile: SVIFile): boolean {
    const fileFullPath = sviFile.getSviFileFullPath();
    // A file is in a cycle if it has an entry in _fileToCyclesMap and that set is not empty.
    return this._fileToCyclesMap.has(fileFullPath) && (this._fileToCyclesMap.get(fileFullPath)?.size || 0) > 0;
  }

  /**
   * Checks if two SVIFile instances are contained within the same dependency cycle.
   * @param sviFile1 The first SVIFile.
   * @param sviFile2 The second SVIFile.
   * @returns True if both files share at least one common dependency cycle, false otherwise.
   */
  areFilesInTheSameCycle(sviFile1: SVIFile, sviFile2: SVIFile): boolean {
    const file1FullPath = sviFile1.getSviFileFullPath();
    const file2FullPath = sviFile2.getSviFileFullPath();

    // If either file is not part of any cycle, they cannot be in the same cycle.
    if (!this._fileToCyclesMap.has(file1FullPath) || !this._fileToCyclesMap.has(file2FullPath)) {
      return false;
    }

    const cyclesOfFile1 = this._fileToCyclesMap.get(file1FullPath);
    const cyclesOfFile2 = this._fileToCyclesMap.get(file2FullPath);

    // This null check provides type safety, though it should logically be true given the check above.
    if (!cyclesOfFile1 || !cyclesOfFile2) {
      return false;
    }

    // Iterate through the cycles associated with file1 and check if any are also associated with file2.
    for (const cycleIndex of cyclesOfFile1) {
      if (cyclesOfFile2.has(cycleIndex)) {
        return true; // Found a common cycle index, so they are in the same cycle.
      }
    }

    return false; // No common cycle found between the two files.
  }
}