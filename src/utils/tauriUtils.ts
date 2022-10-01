export function isRunningUnderTauri() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-underscore-dangle
  return (window as any).__TAURI_IPC__ != null;
}
