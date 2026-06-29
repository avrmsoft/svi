// src\config\configFinder.ts

import fs from "fs";
import path from "path";

export default class ConfigFinder {
  public findConfigFile(startingFolder: string): string | null {
    let currentFolder = path.resolve(startingFolder);
    
    while (true) {
      const filePath = path.join(currentFolder, "svi.json");
      
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      
      const parentFolder = path.dirname(currentFolder);
      if (parentFolder === currentFolder) {
        break;
      }
      
      currentFolder = parentFolder;
    }
    
    return null;
  }
}
