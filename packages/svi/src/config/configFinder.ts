import fs from "fs";
import path from "path";

export default class ConfigFinder {
    /**
     * Finds the 'svi.json' configuration file starting from the given folder
     * and moving up through parent directories until the file is found or the root is reached.
     *
     * @param startingFolder The folder from which to start the search.
     * @returns The absolute path to the found 'svi.json' file, or null if not found.
     */
    findConfigFile(startingFolder: string): string | null {
        const configFileName = "svi.json";
        let currentFolder = path.resolve(startingFolder); // Ensure an absolute starting path

        // To detect when we've reached the root directory, we compare the current folder
        // with the result of path.dirname() for the same folder.
        // If they are identical (e.g., path.dirname('/') is '/'), we're at the root.
        let previousFolder: string | null = null;

        while (currentFolder !== previousFolder) {
            const configFilePath = path.join(currentFolder, configFileName);

            if (fs.existsSync(configFilePath)) {
                return configFilePath;
            }

            previousFolder = currentFolder; // Store current folder before moving up
            currentFolder = path.dirname(currentFolder); // Move one level up
        }

        // If the loop finishes, it means we have reached the root directory
        // and the file was not found in any of the checked folders.
        return null;
    }
}