export function append(path: string, name: string) {
  return path.endsWith("/") ? `${path}${name}` : `${path}/${name}`;
}

export function startsWithDriveName(path: string) {
  if (path.charAt(1) !== ":") {
    return false;
  }
  const drive = path.charAt(0);
  return (drive >= "A" && drive <= "Z") || (drive >= "a" && drive <= "z");
}

export function truncateProtocol(path: string) {
  if (startsWithDriveName(path)) {
    return path;
  }
  path = path.replace(/^[\w._+-]{2,}:+/, "").replace(/^\/+/, "/");
  if (!path) {
    path = "/";
  }
  return path;
}

export function isRoot(path: string) {
  return truncateProtocol(path) === "/";
}

export function truncateLastDir(path: string) {
  if (isRoot(path)) {
    return path;
  }
  const slashIdx = path.lastIndexOf("/");
  return slashIdx >= 0 ? path.substring(0, slashIdx) : path;
}

export function filename(path: string) {
  return path.split("/").at(-1);
}

export function* getAllExtensions(path: string, dotPrefix = false) {
  if (isRoot(path)) {
    return;
  }
  const name = filename(path);
  if (!name) {
    return;
  }
  const extParts = name.split(".");
  for (let i = extParts.length - 1; i > 0; i -= 1) {
    const ext = extParts.slice(i).join(".");
    yield dotPrefix ? `.${ext}` : ext;
  }
}
