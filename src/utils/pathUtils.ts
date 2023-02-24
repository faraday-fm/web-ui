export function trimLastDir(path: string) {
  const lastPathSeparatorIndex = path.lastIndexOf("/");
  if (lastPathSeparatorIndex >= 0) {
    let newPath = path.substring(0, lastPathSeparatorIndex);
    if (newPath === "") {
      newPath = "/";
    }
    return newPath;
  }
  return path;
}

export function splitPath(path: string, separator: string) {
  if (path.startsWith(separator)) {
    path = path.substring(1);
  }
  if (path === "") return [];
  const parts = path.split(separator);
  return parts;
}

export function combinePath(...parts: string[]) {
  let result = parts.join("/");
  if (result.startsWith("//")) result = result.substring(1);
  return result;
}

export function isAbsolutePath(path: string) {
  return path.startsWith("/");
}
