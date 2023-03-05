export function isRoot(url: string) {
  return new URL(url).pathname === "/";
}

export function append(path: string, name: string) {
  return path.endsWith("/") ? `${path}${name}` : `${path}/${name}`;
}

export function truncateLastDir(url: string) {
  if (isRoot(url)) {
    return url;
  }
  const slashIdx = url.lastIndexOf("/");
  return slashIdx >= 0 ? url.substring(0, slashIdx) : url;
}
