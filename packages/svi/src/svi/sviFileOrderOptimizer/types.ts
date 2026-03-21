import { SVIFile } from "../types";

export interface SviDependency {
  SVIFile: SVIFile;
  SviFilesItDependsOn: SVIFile[];
}
