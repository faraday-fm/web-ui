import { QuickView } from "@schemas/manifest";

export type Mimetype = string;
export type FileName = string;
export type FileExtension = string;

export interface FullyQualifiedQuickView {
  extId: string;
  quickView: QuickView;
  script: string;
}
