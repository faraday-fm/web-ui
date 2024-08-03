import { memo } from "react";
import { useFileJsonContent } from "../../features/fs/hooks";
import { ExtensionRepoSchema } from "../../schemas/extensionRepo";
import { combine } from "../../utils/path";
import { Extension } from "./Extension";

export const Extensions = memo(({ root }: { root: string }) => {
  const repo = useFileJsonContent(combine(root, "extensions.json"), ExtensionRepoSchema);

  if (repo.error) {
    console.error("extensions.json is corrupted.", repo.error);
  }

  return <>{repo.content?.map((ext) => <Extension key={ext.identifier.uuid} path={combine(root, ext.relativeLocation)} />) ?? null}</>;
});
