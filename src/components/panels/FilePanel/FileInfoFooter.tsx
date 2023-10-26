import { useGlyphSize } from "@contexts/glyphSizeContext";
import { FsEntry } from "@features/fs/types";
import { css } from "@features/styles";
import { formatDateTime } from "@utils/date";
import { bytesToSize } from "@utils/number";
import { memo } from "react";

interface FileInfoFooterProps {
  file?: FsEntry;
}

function formatFileSize(e?: FsEntry) {
  if (!e) {
    return "";
  }
  // if (e.isDir) {
  //   return e.name === ".." ? "up" : "dir";
  // }
  if (e.isSymlink) {
    return "symlink";
  }
  if (e.isBlockDevice) {
    return "block dev";
  }
  if (e.isCharacterDevice) {
    return "char dev";
  }
  if (e.isFIFO) {
    return "fifo";
  }
  if (e.isSocket) {
    return "socket";
  }
  return bytesToSize(e.size ?? 0, 999999);
}

export const FileInfoFooter = memo(({ file }: FileInfoFooterProps) => {
  const { height } = useGlyphSize();
  return (
    <div className={css("FileInfoRoot")} style={{ height }}>
      <div className={css("FileInfoName")}>{file?.name}</div>
      <div className={css("FileInfoSize")}>{formatFileSize(file)}</div>
      <div className={css("FileInfoTime")}>{file?.modified ? formatDateTime(new Date(file.modified)) : undefined}</div>
    </div>
  );
});
