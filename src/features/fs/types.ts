export type FileHandle = string;

export enum FileType {
  SSH_FILEXFER_TYPE_REGULAR = 1,
  SSH_FILEXFER_TYPE_DIRECTORY = 2,
  SSH_FILEXFER_TYPE_SYMLINK = 3,
  SSH_FILEXFER_TYPE_SPECIAL = 4,
  SSH_FILEXFER_TYPE_UNKNOWN = 5,
  SSH_FILEXFER_TYPE_SOCKET = 6,
  SSH_FILEXFER_TYPE_CHAR_DEVICE = 7,
  SSH_FILEXFER_TYPE_BLOCK_DEVICE = 8,
  SSH_FILEXFER_TYPE_FIFO = 9,
}

export enum Permissions {
  S_IRUSR = 0o0000400, // octal
  S_IWUSR = 0o0000200,
  S_IXUSR = 0o0000100,
  S_IRGRP = 0o0000040,
  S_IWGRP = 0o0000020,
  S_IXGRP = 0o0000010,
  S_IROTH = 0o0000004,
  S_IWOTH = 0o0000002,
  S_IXOTH = 0o0000001,
  S_ISUID = 0o0004000,
  S_ISGID = 0o0002000,
  S_ISVTX = 0o0001000,
}

export enum AttribBits {
  SSH_FILEXFER_ATTR_FLAGS_READONLY = 0x00000001,
  SSH_FILEXFER_ATTR_FLAGS_SYSTEM = 0x00000002,
  SSH_FILEXFER_ATTR_FLAGS_HIDDEN = 0x00000004,
  SSH_FILEXFER_ATTR_FLAGS_CASE_INSENSITIVE = 0x00000008,
  SSH_FILEXFER_ATTR_FLAGS_ARCHIVE = 0x00000010,
  SSH_FILEXFER_ATTR_FLAGS_ENCRYPTED = 0x00000020,
  SSH_FILEXFER_ATTR_FLAGS_COMPRESSED = 0x00000040,
  SSH_FILEXFER_ATTR_FLAGS_SPARSE = 0x00000080,
  SSH_FILEXFER_ATTR_FLAGS_APPEND_ONLY = 0x00000100,
  SSH_FILEXFER_ATTR_FLAGS_IMMUTABLE = 0x00000200,
  SSH_FILEXFER_ATTR_FLAGS_SYNC = 0x00000400,
  SSH_FILEXFER_ATTR_FLAGS_TRANSLATION_ERR = 0x00000800,
}

export enum AttrFlags {
  SSH_FILEXFER_ATTR_SIZE = 0x00000001,
  SSH_FILEXFER_ATTR_PERMISSIONS = 0x00000004,
  SSH_FILEXFER_ATTR_ACCESSTIME = 0x00000008,
  SSH_FILEXFER_ATTR_CREATETIME = 0x00000010,
  SSH_FILEXFER_ATTR_MODIFYTIME = 0x00000020,
  SSH_FILEXFER_ATTR_ACL = 0x00000040,
  SSH_FILEXFER_ATTR_OWNERGROUP = 0x00000080,
  SSH_FILEXFER_ATTR_SUBSECOND_TIMES = 0x00000100,
  SSH_FILEXFER_ATTR_BITS = 0x00000200,
  SSH_FILEXFER_ATTR_ALLOCATION_SIZE = 0x00000400,
  SSH_FILEXFER_ATTR_TEXT_HINT = 0x00000800,
  SSH_FILEXFER_ATTR_MIME_TYPE = 0x00001000,
  SSH_FILEXFER_ATTR_LINK_COUNT = 0x00002000,
  SSH_FILEXFER_ATTR_UNTRANSLATED_NAME = 0x00004000,
  SSH_FILEXFER_ATTR_CTIME = 0x00008000,
  SSH_FILEXFER_ATTR_EXTENDED = 0x80000000,
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
  ACE4_READ_DATA = 0x00000001, // Permission to read the data of the file
  ACE4_LIST_DIRECTORY = 0x00000001, // Permission to list the contents of a directory
  ACE4_WRITE_DATA = 0x00000002, // Permission to modify the file's data
  ACE4_ADD_FILE = 0x00000002, // Permission to add a new file to a directory
  ACE4_APPEND_DATA = 0x00000004, // Permission to append data to a file
  ACE4_ADD_SUBDIRECTORY = 0x00000004, // Permission to create a subdirectory to a directory
  ACE4_READ_NAMED_ATTRS = 0x00000008, // Permission to read the named attributes of a file
  ACE4_WRITE_NAMED_ATTRS = 0x00000010, // Permission to write the named attributes of a file
  ACE4_EXECUTE = 0x00000020, // Permission to execute a file
  ACE4_DELETE_CHILD = 0x00000040, // Permission to delete a file or directory within a directory
  ACE4_READ_ATTRIBUTES = 0x00000080, // The ability to read basic attributes (non-acls) of a file
  ACE4_WRITE_ATTRIBUTES = 0x00000100, // Permission to change basic attributes (non-acls) of a file
  ACE4_DELETE = 0x00010000, // Permission to Delete the file
  ACE4_READ_ACL = 0x00020000, // Permission to Read the ACL
  ACE4_WRITE_ACL = 0x00040000, // Permission to Write the ACL
  ACE4_WRITE_OWNER = 0x00080000, // Permission to change the owner
  ACE4_SYNCHRONIZE = 0x00100000, // Permission to access file locally at the server with synchronous reads and writes
}

/** @see https://datatracker.ietf.org/doc/html/draft-ietf-secsh-filexfer-13#section-8.1.1.3 */
export enum Flags {
  SSH_FXF_ACCESS_DISPOSITION = 0x00000007,
  SSH_FXF_CREATE_NEW = 0x00000000,
  SSH_FXF_CREATE_TRUNCATE = 0x00000001,
  SSH_FXF_OPEN_EXISTING = 0x00000002,
  SSH_FXF_OPEN_OR_CREATE = 0x00000003,
  SSH_FXF_TRUNCATE_EXISTING = 0x00000004,
  SSH_FXF_APPEND_DATA = 0x00000008,
  SSH_FXF_APPEND_DATA_ATOMIC = 0x00000010,
  SSH_FXF_TEXT_MODE = 0x00000020,
  SSH_FXF_BLOCK_READ = 0x00000040,
  SSH_FXF_BLOCK_WRITE = 0x00000080,
  SSH_FXF_BLOCK_DELETE = 0x00000100,
  SSH_FXF_BLOCK_ADVISORY = 0x00000200,
  SSH_FXF_NOFOLLOW = 0x00000400,
  SSH_FXF_DELETE_ON_CLOSE = 0x00000800,
  SSH_FXF_ACCESS_AUDIT_ALARM_INFO = 0x00001000,
  SSH_FXF_ACCESS_BACKUP = 0x00002000,
  SSH_FXF_BACKUP_STREAM = 0x00004000,
  SSH_FXF_OVERRIDE_OWNER = 0x00008000,
}

export enum RenameFlags {
  SSH_FXF_RENAME_OVERWRITE = 0x00000001,
  SSH_FXF_RENAME_ATOMIC = 0x00000002,
  SSH_FXF_RENAME_NATIVE = 0x00000004,
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
  SSH_FXP_REALPATH_NO_CHECK = 0x00000001,
  SSH_FXP_REALPATH_STAT_IF = 0x00000002,
  SSH_FXP_REALPATH_STAT_ALWAYS = 0x00000003,
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
