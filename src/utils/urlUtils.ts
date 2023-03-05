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
  return path.replace(/^[\w._+-]{2,}:\/+/, "");
}

export function isRoot(path: string) {
  return truncateProtocol(path) === "";
}

export function truncateLastDir(path: string) {
  if (isRoot(path)) {
    return path;
  }
  const slashIdx = path.lastIndexOf("/");
  return slashIdx >= 0 ? path.substring(0, slashIdx) : path;
}
