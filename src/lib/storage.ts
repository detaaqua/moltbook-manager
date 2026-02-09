const KEY = "moltbook_api_key";
const MODE_KEY = "moltbook_storage_mode";

export type StorageMode = "session" | "local";

export function getStorageMode(): StorageMode {
  if (typeof window === "undefined") return "session";
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "local" ? "local" : "session";
}

export function setStorageMode(mode: StorageMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
  // Move key between stores if needed.
  const current = getApiKey();
  clearApiKey();
  if (current) setApiKey(current, mode);
}

export function setApiKey(apiKey: string, mode: StorageMode = getStorageMode()) {
  if (typeof window === "undefined") return;
  if (mode === "local") window.localStorage.setItem(KEY, apiKey);
  else window.sessionStorage.setItem(KEY, apiKey);
}

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  const local = window.localStorage.getItem(KEY);
  const session = window.sessionStorage.getItem(KEY);
  return session || local;
}

export function clearApiKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.sessionStorage.removeItem(KEY);
}
