import { PropsWithChildren, createContext, useContext, useState } from "react";
import { useFaradayHost } from "../../contexts/faradayHostContext";
import { CombinedFsProvider } from "./combinedFs";
import { FileSystemProvider as FileSystem } from "./types";

const FileSystemContext = createContext<FileSystem | undefined>(undefined);

export function useFileSystem() {
  const fileSystem = useContext(FileSystemContext);
  if (!fileSystem) {
    throw Error("FileSystemProvider is not defined.");
  }
  return fileSystem;
}

export function FileSystemProvider({ children }: PropsWithChildren) {
  const host = useFaradayHost();
  const [fs] = useState(() => new CombinedFsProvider({ "faraday:": host.faradayFs, "file:": host.rootFs }));
  return <FileSystemContext.Provider value={fs}>{children}</FileSystemContext.Provider>;
}
