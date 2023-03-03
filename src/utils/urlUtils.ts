function appendSlash(url: URL | string) {
  if (typeof url === "string") {
    return new URL(url.endsWith("/") ? url : `${url}/`);
  }
  return url.pathname.endsWith("/") ? url : new URL(`${url.pathname}/`);
}

export function isRoot(url: URL | string) {
  return typeof url === "string" ? new URL(url).pathname === "/" : url.pathname === "/";
}

export function append(url: URL | string, name: string, isDir: boolean) {
  name = encodeURI(name);
  return new URL(isDir ? `${name}/` : name, appendSlash(url));
}

export function truncateLastDir(url: URL | string) {
  if (isRoot(url)) {
    return new URL(url);
  }
  return new URL("..", appendSlash(url));
}

export function getPathName(url: URL | string) {
  url = typeof url === "string" ? new URL(url) : url;
  return decodeURI(url.pathname);
}

export function getEntryName(url: URL | string) {
  const path = typeof url === "string" ? url : url.pathname;
  return path.substring(path.lastIndexOf("/") + 1);
}
