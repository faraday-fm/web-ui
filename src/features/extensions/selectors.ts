import { createSelector } from "@reduxjs/toolkit";
import { QuickView } from "@schemas/manifest";
import { RootState } from "@store";
import { filename, getAllExtensions } from "@utils/path";

type Mimetype = string;
type FileName = string;
type FileExtension = string;

const quickViewsSelector = (state: RootState) => state.extensions.quickViews;

const activeFilePathSelector = (state: RootState) => state.globalContext["filePanel.selectedPath"];

const quickViewsByMimetypeSelector = createSelector(quickViewsSelector, (quickViews) => {
  const result: Record<Mimetype, { extId: string; quickView: QuickView; script: string }[]> = {};
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
});

const quickViewsByFileNameSelector = createSelector(quickViewsSelector, (quickViews) => {
  const result: Record<FileName, { extId: string; quickView: QuickView; script: string }[]> = {};
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
});

const quickViewsByFileExtensionSelector = createSelector(quickViewsSelector, (quickViews) => {
  const result: Record<FileExtension, { extId: string; quickView: QuickView; script: string }[]> = {};
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
});

/* @internal */
export const quickViewSelector = createSelector(
  quickViewsByMimetypeSelector,
  quickViewsByFileNameSelector,
  quickViewsByFileExtensionSelector,
  activeFilePathSelector,
  (quickViewsByMimetype, quickViewsByFileName, quickViewsByFileExtension, activeFilePath) => {
    if (!activeFilePath) {
      return undefined;
    }
    const fileName = filename(activeFilePath);
    if (!fileName) {
      return undefined;
    }
    if (quickViewsByFileName[fileName]?.length > 0) {
      return quickViewsByFileName[fileName][0];
    }
    for (const ext of getAllExtensions(fileName, true)) {
      if (quickViewsByFileExtension[ext]?.length > 0) {
        return quickViewsByFileExtension[ext][0];
      }
    }
    return undefined;
  }
);
