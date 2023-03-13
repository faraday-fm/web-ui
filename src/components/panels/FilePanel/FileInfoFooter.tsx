import { useGlyphSize } from "@contexts/glyphSizeContext";
import { FsEntry } from "@features/fs/types";
import { formatDateTime } from "@utils/date";
import { bytesToSize } from "@utils/number";
import styled from "styled-components";

type FileInfoFooterProps = {
  file?: FsEntry;
};

const FileRoot = styled.div`
  display: flex;
  overflow: hidden;
  padding: 0.5rem 0;
`;
const FileName = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
`;
const FileSize = styled.div`
  white-space: nowrap;
  justify-self: flex-end;
  margin: 0 0.75rem;
`;
const FileTime = styled.div`
  white-space: nowrap;
  justify-self: flex-end;
`;

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

export function FileInfoFooter({ file }: FileInfoFooterProps) {
  const { height } = useGlyphSize();
  return (
    <FileRoot>
      <FileName style={{ height }}>{file?.name}</FileName>
      <FileSize>{formatFileSize(file)}</FileSize>
      <FileTime>{file?.modified ? formatDateTime(new Date(file.modified)) : undefined}</FileTime>
    </FileRoot>
  );
}
