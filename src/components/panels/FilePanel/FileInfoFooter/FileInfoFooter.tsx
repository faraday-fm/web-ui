import styled from "styled-components";
import { FsEntry } from "~/src/types";
import { formatDateTime } from "~/src/utils/dateUtils";
import { bytesToSize } from "~/src/utils/numberUtils";

type FileInfoFooterProps = {
  file?: FsEntry;
};

const FileRoot = styled.div`
  display: flex;
  overflow: hidden;
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
      <FileTime>{file?.modified ? formatDateTime(new Date(file.modified * 1000)) : undefined}</FileTime>
    </FileRoot>
  );
}
