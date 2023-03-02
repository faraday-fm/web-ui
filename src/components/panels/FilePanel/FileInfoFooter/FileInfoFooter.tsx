import { FsEntry } from "@features/fs/types";
import { formatDateTime } from "@utils/dateUtils";
import { bytesToSize } from "@utils/numberUtils";
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
  return (
    <FileRoot>
      <FileName>{file?.name}</FileName>
      <FileSize>{file?.isDir ? "Папка" : bytesToSize(file?.size ?? 0, 999999)}</FileSize>
      <FileTime>{file?.modified ? formatDateTime(new Date(file.modified)) : undefined}</FileTime>
    </FileRoot>
  );
}
