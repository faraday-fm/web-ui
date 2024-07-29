import { from, state } from "effie";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { ExtensionRepoSchema } from "../../schemas/extensionRepo";
import { combine } from "../../utils/path";
import { Extension } from "./Extension";

export const Extensions = ({ root }: { root: string }) => {
  // const refs = useRef<ReturnType<typeof Extension>[typeof $stateType][]>([]);
  const { content: exts = [], error } = useFileJsonContent({
    path: combine(root, "extensions.json"),
    schema: ExtensionRepoSchema,
  });

  if (error) {
    console.error("File extensions.json is corrupted.", error);
  }

  return state(
    exts.map((ext) =>
      // similar to <Extension path={combine(root, ext.relativeLocation)} id={ext.identifier.uuid} />
      from(Extension, {
        path: combine(root, ext.relativeLocation),
        id: ext.identifier.uuid,
      })
    )
  );
};
