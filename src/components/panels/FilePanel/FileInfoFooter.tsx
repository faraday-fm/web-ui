import { memo } from "react";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { css } from "../../../features/styles";
import { formatDateTime } from "../../../utils/date";
import { bytesToSize } from "../../../utils/number";
import { type Dirent, FileType } from "../../../features/fs/types";
import { isDir } from "../../../features/fs/utils";

interface FileInfoFooterProps {
  file?: Dirent;
}

function formatFileSize(e?: Dirent) {
  if (!e) {
    return "";
  }
  if (isDir(e)) {
    return e.filename === ".." ? "up" : "dir";
  }
  switch (e.attrs.type) {
    case FileType.SYMLINK:
      return "symlink";
    case FileType.BLOCK_DEVICE:
      return "block dev";
    case FileType.CHAR_DEVICE:
      return "char dev";
    case FileType.TYPE_FIFO:
      return "fifo";
    case FileType.SOCKET:
      return "socket";
    default:
      return bytesToSize(e.attrs.size ?? 0, 999999);
  }
}

export const FileInfoFooter = memo(({ file }: FileInfoFooterProps) => {
  const { height } = useGlyphSize();
  return (
    <div className={css("file-info-root")} style={{ height }}>
      <div className={css("file-info-name")}>{file?.filename}</div>
      <div className={css("file-info-size")}>{formatFileSize(file)}</div>
      <div className={css("file-info-time")}>{file?.attrs.mtime ? formatDateTime(new Date(file.attrs.mtime)) : undefined}</div>
    </div>
  );
});
