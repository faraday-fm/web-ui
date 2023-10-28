import { filename, getAllExtensions } from "../../utils/path";
import { useQuickViewsByFileExtension } from "./useQuickViewsByFileExtension";
import { useQuickViewsByFileName } from "./useQuickViewsByFileName";
import { useQuickViewsByMimetype } from "./useQuickViewsByMimetype";

export function useQuickView(filePath: string | undefined, mimetype?: string) {
  const qvByFileName = useQuickViewsByFileName();
  const qvByFileExtension = useQuickViewsByFileExtension();
  const qvByFileMimetype = useQuickViewsByMimetype();

  if (!filePath) {
    return undefined;
  }

  const fileName = filename(filePath);
  if (!fileName) {
    return undefined;
  }

  if (qvByFileName[fileName]?.length > 0) {
    return qvByFileName[fileName][0];
  }

  for (const ext of getAllExtensions(fileName, true)) {
    if (qvByFileExtension[ext]?.length > 0) {
      return qvByFileExtension[ext][0];
    }
  }

  if (mimetype) {
    if (qvByFileMimetype[mimetype]?.length > 0) {
      return qvByFileMimetype[mimetype][0];
    }
  }

  return undefined;
}
