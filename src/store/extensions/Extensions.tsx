import { from, state } from "react-rehoox";
import { Extension } from "./Extension";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { combine } from "../../utils/path";
import { ExtensionRepoSchema } from "../../schemas/extensionRepo";

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
