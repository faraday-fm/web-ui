import { InferStateType, from, state } from "effie";
import { useCallback, useEffect, useState } from "react";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { IconThemeSchema } from "../../schemas/iconTheme";
import { IconThemeDefinition } from "../../schemas/manifest";
import { combine } from "../../utils/path";
import { FileIcon } from "./FileIcon";

export function IconThemeContribution({ extensionHomePath, iconTheme }: { extensionHomePath: string; iconTheme: IconThemeDefinition }) {
  const [isActive, setIsActive] = useState(true);
  const filePath = combine(extensionHomePath, iconTheme.path);
  const { content: theme, error } = useFileJsonContent({
    path: filePath,
    schema: IconThemeSchema,
    skip: !isActive,
  });

  useEffect(() => {
    if (error) {
      console.error(`Unable to load icon theme '${iconTheme.id}'`, error.message);
    }
  }, [error, iconTheme.id]);

  const resolve = useCallback(
    (path: string, isDir: boolean) => {
      if (!theme) {
        return undefined;
      }
      return from(FileIcon, { path, isDir, iconTheme: theme });
    },
    [theme]
  );

  return state({
    id: iconTheme.id,
    path: filePath,
    isActive,
    setIsActive,
    theme,
    resolve,
  });
}

export type IconThemeContributionState = InferStateType<ReturnType<typeof IconThemeContribution>>;
