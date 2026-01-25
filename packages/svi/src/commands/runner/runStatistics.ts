import logger from "../../utils/logger";

interface WrittenFile {
  filePath: string;
  isUpdate: boolean;
}

export default class RunStatistics {
  private static instance: RunStatistics;

  private writtenFiles: WrittenFile[] = [];

  private constructor() {}

  public static getInstance(): RunStatistics {
    if (!RunStatistics.instance) {
      RunStatistics.instance = new RunStatistics();
    }
    return RunStatistics.instance;
  }

  public addFileCreated(filePath: string): void {
    this.writtenFiles.push({ filePath, isUpdate: false });
  }

  public addFileUpdated(filePath: string): void {
    this.writtenFiles.push({ filePath, isUpdate: true });
  }

  public getTotalFilesProcessed(): number {
    return this.writtenFiles.length;
  }

  public logWrittenFiles(): void {
    if (this.writtenFiles.length === 0) {
      logger.info("No files were created or updated.");
      return;
    }

    logger.info("Processed files:");
    for (const file of this.writtenFiles) {
      const action = file.isUpdate ? "Updated" : "Created";
      logger.info(`- ${action}: ${file.filePath}`);
    }
  }
}
