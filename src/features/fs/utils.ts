import { type Dirent, FileType } from "./types";

export function isDir(dirent: Dirent) {
  return dirent.attrs.type === FileType.DIRECTORY;
}
