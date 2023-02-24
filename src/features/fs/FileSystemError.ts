export class FileSystemError extends Error {
  readonly url?: URL;

  /**
   * Creates a new filesystem error.
   *
   * @param messageOrUrl Message or url.
   */
  constructor(messageOrUrl?: string | URL) {
    super(typeof messageOrUrl === "string" ? messageOrUrl : undefined);
    if (messageOrUrl instanceof URL) {
      this.url = messageOrUrl;
    }
  }

  /**
   * Create an error to signal that a file or folder wasn't found.
   * @param messageOrUri Message or uri.
   */
  static FileNotFound(messageOrUrl?: string | URL): FileSystemError {
    return new FileSystemError(messageOrUrl);
  }

  /**
   * Create an error to signal that a file or folder already exists, e.g. when
   * creating but not overwriting a file.
   * @param messageOrUri Message or uri.
   */
  static FileExists(messageOrUrl?: string | URL): FileSystemError {
    return new FileSystemError(messageOrUrl);
  }

  /**
   * Create an error to signal that a file is not a folder.
   * @param messageOrUri Message or uri.
   */
  static FileNotADirectory(messageOrUrl?: string | URL): FileSystemError {
    return new FileSystemError(messageOrUrl);
  }

  /**
   * Create an error to signal that a file is a folder.
   * @param messageOrUri Message or uri.
   */
  static FileIsADirectory(messageOrUrl?: string | URL): FileSystemError {
    return new FileSystemError(messageOrUrl);
  }

  /**
   * Create an error to signal that an operation lacks required permissions.
   * @param messageOrUri Message or uri.
   */
  static NoPermissions(messageOrUrl?: string | URL): FileSystemError {
    return new FileSystemError(messageOrUrl);
  }
}
