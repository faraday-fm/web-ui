export type FileHandle = string;

export enum FileType {
  REGULAR = 1,
  DIRECTORY = 2,
  SYMLINK = 3,
  SPECIAL = 4,
  UNKNOWN = 5,
  SOCKET = 6,
  CHAR_DEVICE = 7,
  BLOCK_DEVICE = 8,
  TYPE_FIFO = 9,
}

export enum Permissions {
  IRUSR = 0o0000400, // octal
  IWUSR = 0o0000200,
  IXUSR = 0o0000100,
  IRGRP = 0o0000040,
  IWGRP = 0o0000020,
  IXGRP = 0o0000010,
  IROTH = 0o0000004,
  IWOTH = 0o0000002,
  IXOTH = 0o0000001,
  ISUID = 0o0004000,
  ISGID = 0o0002000,
  ISVTX = 0o0001000,
}

export enum AttribBits {
  READONLY = 0x00000001,
  SYSTEM = 0x00000002,
  HIDDEN = 0x00000004,
  CASE_INSENSITIVE = 0x00000008,
  ARCHIVE = 0x00000010,
  ENCRYPTED = 0x00000020,
  COMPRESSED = 0x00000040,
  SPARSE = 0x00000080,
  APPEND_ONLY = 0x00000100,
  IMMUTABLE = 0x00000200,
  SYNC = 0x00000400,
  TRANSLATION_ERR = 0x00000800,
}

export enum AttrFlags {
  SIZE = 0x00000001,
  PERMISSIONS = 0x00000004,
  ACCESSTIME = 0x00000008,
  CREATETIME = 0x00000010,
  MODIFYTIME = 0x00000020,
  ACL = 0x00000040,
  OWNERGROUP = 0x00000080,
  SUBSECOND_TIMES = 0x00000100,
  BITS = 0x00000200,
  ALLOCATION_SIZE = 0x00000400,
  TEXT_HINT = 0x00000800,
  MIME_TYPE = 0x00001000,
  LINK_COUNT = 0x00002000,
  UNTRANSLATED_NAME = 0x00004000,
  CTIME = 0x00008000,
  EXTENDED = 0x80000000,
}

export type Attrs = {
  type: FileType;
  size?: number;
  allocationSize?: number;
  owner?: string;
  group?: string;
  permissions?: Permissions;
  atime?: number;
  atimeNseconds?: number;
  createtime?: number;
  createtimeNseconds?: number;
  mtime?: number;
  mtimeNseconds?: number;
  ctime?: number;
  ctimeNseconds?: number;
  acl?: Uint8Array;
  attribBits?: AttribBits;
  attribBitsValid?: AttribBits;
  textHint?: number;
  mimeType?: string;
  linkCount?: number;
  untranslatedName?: string;
  // extendedCount?: number;
  extensions?: unknown; // FileAttributesExtensions
};

export enum AceMask {
  READ_DATA = 0x00000001, // Permission to read the data of the file
  LIST_DIRECTORY = 0x00000001, // Permission to list the contents of a directory
  WRITE_DATA = 0x00000002, // Permission to modify the file's data
  ADD_FILE = 0x00000002, // Permission to add a new file to a directory
  APPEND_DATA = 0x00000004, // Permission to append data to a file
  ADD_SUBDIRECTORY = 0x00000004, // Permission to create a subdirectory to a directory
  READ_NAMED_ATTRS = 0x00000008, // Permission to read the named attributes of a file
  WRITE_NAMED_ATTRS = 0x00000010, // Permission to write the named attributes of a file
  EXECUTE = 0x00000020, // Permission to execute a file
  DELETE_CHILD = 0x00000040, // Permission to delete a file or directory within a directory
  READ_ATTRIBUTES = 0x00000080, // The ability to read basic attributes (non-acls) of a file
  WRITE_ATTRIBUTES = 0x00000100, // Permission to change basic attributes (non-acls) of a file
  DELETE = 0x00010000, // Permission to Delete the file
  READ_ACL = 0x00020000, // Permission to Read the ACL
  WRITE_ACL = 0x00040000, // Permission to Write the ACL
  WRITE_OWNER = 0x00080000, // Permission to change the owner
  SYNCHRONIZE = 0x00100000, // Permission to access file locally at the server with synchronous reads and writes
}

/** @see https://datatracker.ietf.org/doc/html/draft-ietf-secsh-filexfer-13#section-8.1.1.3 */
export enum Flags {
  ACCESS_DISPOSITION = 0x00000007,
  CREATE_NEW = 0x00000000,
  CREATE_TRUNCATE = 0x00000001,
  OPEN_EXISTING = 0x00000002,
  OPEN_OR_CREATE = 0x00000003,
  TRUNCATE_EXISTING = 0x00000004,
  APPEND_DATA = 0x00000008,
  APPEND_DATA_ATOMIC = 0x00000010,
  TEXT_MODE = 0x00000020,
  BLOCK_READ = 0x00000040,
  BLOCK_WRITE = 0x00000080,
  BLOCK_DELETE = 0x00000100,
  BLOCK_ADVISORY = 0x00000200,
  NOFOLLOW = 0x00000400,
  DELETE_ON_CLOSE = 0x00000800,
  ACCESS_AUDIT_ALARM_INFO = 0x00001000,
  ACCESS_BACKUP = 0x00002000,
  BACKUP_STREAM = 0x00004000,
  OVERRIDE_OWNER = 0x00008000,
}

export enum RenameFlags {
  OVERWRITE = 0x00000001,
  ATOMIC = 0x00000002,
  NATIVE = 0x00000004,
}

export type Dirent = {
  filename: string;
  path: string;
  attrs: Attrs;
};

export type DirList = {
  files: Dirent[];
  endOfList?: true;
};

export enum RealPathControlByte {
  NO_CHECK = 0x00000001,
  STAT_IF = 0x00000002,
  STAT_ALWAYS = 0x00000003,
}

export type FileChangeType = "changed" | "created" | "deleted";

export type RequestOptions = { signal?: AbortSignal };

export interface FileSystemProvider {
  // watchDir(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }): Promise<void>;
  // watchFile(path: string, watcher: FileSystemWatcher, options?: { signal?: AbortSignal }): Promise<void>;
  // readDirectory(path: string, options?: { signal?: AbortSignal }): Promise<FsEntry[]>;
  // createDirectory(path: string, options?: { signal?: AbortSignal }): Promise<void>;
  open(filename: string, desiredAccess: AceMask, flags: Flags, attrs?: Attrs, options?: RequestOptions): Promise<FileHandle>;
  openDir(path: string, options?: RequestOptions): Promise<FileHandle>;
  close(handle: FileHandle, options?: RequestOptions): Promise<void>;
  read(handle: FileHandle, offset: number, length: number, options?: RequestOptions): Promise<Uint8Array>;
  readDir(handle: FileHandle, options?: RequestOptions): Promise<DirList>;
  write(handle: FileHandle, offset: number, data: Uint8Array, options?: RequestOptions): Promise<void>;
  remove(filename: string, options?: RequestOptions): Promise<void>;
  rename(oldpath: string, newpath: string, flags: RenameFlags, options?: RequestOptions): Promise<void>;
  mkdir(path: string, attrs: Attrs, options?: RequestOptions): Promise<void>;
  rmdir(path: string, options?: RequestOptions): Promise<void>;
  stat(path: string, flags: AttrFlags, options?: RequestOptions): Promise<Attrs>;
  lstat(path: string, flags: AttrFlags, options?: RequestOptions): Promise<Attrs>;
  fstat(handle: FileHandle, flags: AttrFlags, options?: RequestOptions): Promise<Attrs>;
  setStat(path: string, attrs: Attrs, options?: RequestOptions): Promise<void>;
  setFstat(handle: FileHandle, attrs: Attrs, options?: RequestOptions): Promise<void>;
  readLink(path: string, options?: RequestOptions): Promise<DirList>;
  link(newLinkPath: string, existingPath: string, symLink: boolean, options?: RequestOptions): Promise<void>;
  block(handle: FileHandle, offset: number, length: number, uLockMask: Flags, options?: RequestOptions): Promise<void>;
  unblock(handle: FileHandle, offset: number, length: number, options?: RequestOptions): Promise<void>;
  realpath(originalPath: string, controlByte?: RealPathControlByte, composePath?: string[], options?: RequestOptions): Promise<DirList>;
  // writeFile(path: string, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
  // delete(path: string, options?: { recursive?: boolean; signal?: AbortSignal }): Promise<void>;
  // rename(oldPath: string, newPath: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
  // copy?(source: string, destination: string, options?: { overwrite?: boolean; signal?: AbortSignal }): Promise<void>;
  // mount?(path: string, fs: FileSystemProvider): Promise<void>;
  textSeek?(fileHandle: FileHandle, lineNumber: number, options?: RequestOptions): Promise<void>;
}
