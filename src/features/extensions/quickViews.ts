import { QuickView } from "@schemas/manifest";
import { filename, getAllExtensions } from "@utils/path";
import { useMemo } from "react";
import { useExtensions } from "./hooks";

type Mimetype = string;
type FileName = string;
type FileExtension = string;

export interface FullyQualifiedQuickView {
  extId: string;
  quickView: QuickView;
  script: string;
}

export function useQuickViews() {
  return useExtensions().quickViews;
}

export function useQuickViewsByMimetype() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<Mimetype, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([extId, eqv]) => {
      Object.values(eqv).forEach((qv) => {
        if (qv.quickView.mimetypes) {
          qv.quickView.mimetypes.forEach((mimetype) => {
            (result[mimetype] ??= []).push({ extId, quickView: qv.quickView, script: qv.script });
          });
        }
      });
    });
    return result;
  }, [quickViews]);
}

export function useQuickViewsByFileName() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<FileName, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([extId, eqv]) => {
      Object.values(eqv).forEach((qv) => {
        if (qv.quickView.filenames) {
          qv.quickView.filenames.forEach((fileName) => {
            (result[fileName] ??= []).push({ extId, quickView: qv.quickView, script: qv.script });
          });
        }
      });
    });
    return result;
  }, [quickViews]);
}

export function useQuickViewsByFileExtension() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<FileExtension, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([extId, eqv]) => {
      Object.values(eqv).forEach((qv) => {
        if (qv.quickView.extensions) {
          qv.quickView.extensions.forEach((fileExtension) => {
            (result[fileExtension] ??= []).push({ extId, quickView: qv.quickView, script: qv.script });
          });
        }
      });
    });
    return result;
  }, [quickViews]);
}

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
