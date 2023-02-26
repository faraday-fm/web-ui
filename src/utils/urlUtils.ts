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
  return new URL(isDir ? `${name}/` : name, appendSlash(url));
}

export function truncateLastDir(url: URL | string) {
  if (isRoot(url)) {
    return new URL(url);
  }
  return new URL("..", appendSlash(url));
}
