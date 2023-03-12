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

export function FileInfoFooter({ file }: FileInfoFooterProps) {
  const { height } = useGlyphSize();
  return (
    <FileRoot>
      <FileName style={{ lineHeight: `${height}px` }}>{file?.name}</FileName>
      <FileSize>{file?.isDir ? "Папка" : bytesToSize(file?.size ?? 0, 999999)}</FileSize>
      <FileTime>{file?.modified ? formatDateTime(new Date(file.modified)) : undefined}</FileTime>
    </FileRoot>
  );
}
