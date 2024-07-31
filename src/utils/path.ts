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
  path = path.replace(/^[\w._+-]{2,}:+/, "");
  if (!path) {
    path = "/";
  }
  return path;
}

export function isRoot(path: string) {
  path = truncateProtocol(path);
  return path === "/" || startsWithDriveName(path);
}

export function isAbsolute(path: string) {
  path = truncateProtocol(path);
  return path.startsWith("/") || (startsWithDriveName(path) && (path.charAt(2) === "\\" || path.charAt(2) === "/"));
}

export function truncateLastDir(path: string) {
  if (isRoot(path)) {
    return path;
  }
  const slashIdx = path.lastIndexOf("/");
  const result = slashIdx >= 0 ? path.substring(0, slashIdx) : path;
  return !result ? "/" : result;
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

export function combine(path: string, name: string) {
  if (isAbsolute(name)) {
    return name;
  }
  return path.endsWith("/") ? `${path}${name}` : `${path}/${name}`;
}
