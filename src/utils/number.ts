export function clamp(min: number, cur: number, max: number) {
  return Math.max(min, Math.min(cur, max));
}

const sizes = ["", "K", "M", "G", "T", "P", "E"];
export function bytesToSize(bytes: number, maxBytes?: number) {
  if (maxBytes && bytes <= maxBytes) return bytes.toString();
  if (bytes === 0) return "0";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / 1024 ** i)}${sizes[i]}`;
}
