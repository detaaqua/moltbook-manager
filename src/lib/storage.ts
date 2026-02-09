const MODE_KEY = "moltbook_storage_mode";
const ACCOUNTS_KEY = "moltbook_accounts_v1";
const ACTIVE_ID_KEY = "moltbook_active_account_id";
const SESSION_API_KEY = "moltbook_session_api_key";

export type StorageMode = "session" | "local";

export type MoltbookAccount = {
  id: string;
  label: string;
  apiKey: string;
  createdAt: number;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function getStorageMode(): StorageMode {
  if (typeof window === "undefined") return "session";
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "local" ? "local" : "session";
}

export function setStorageMode(mode: StorageMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
  // no migration needed; mode only controls whether we keep an active key in sessionStorage.
}

export function listAccounts(): MoltbookAccount[] {
  if (typeof window === "undefined") return [];
  return safeParse<MoltbookAccount[]>(window.localStorage.getItem(ACCOUNTS_KEY)) ?? [];
}

function saveAccounts(accounts: MoltbookAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function addAccount(params: { label: string; apiKey: string }): MoltbookAccount {
  if (typeof window === "undefined") {
    throw new Error("addAccount can only run in browser");
  }
  const accounts = listAccounts();
  const acc: MoltbookAccount = {
    id: uid(),
    label: params.label.trim() || "Agent",
    apiKey: params.apiKey.trim(),
    createdAt: Date.now(),
  };
  accounts.unshift(acc);
  saveAccounts(accounts);
  return acc;
}

export function removeAccount(accountId: string) {
  if (typeof window === "undefined") return;
  const accounts = listAccounts().filter((a) => a.id !== accountId);
  saveAccounts(accounts);
  const active = getActiveAccountId();
  if (active === accountId) {
    window.localStorage.removeItem(ACTIVE_ID_KEY);
    window.sessionStorage.removeItem(SESSION_API_KEY);
  }
}

export function getActiveAccountId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ID_KEY);
}

export function setActiveAccountId(accountId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ID_KEY, accountId);
  const acc = listAccounts().find((a) => a.id === accountId);
  if (acc && getStorageMode() === "session") {
    window.sessionStorage.setItem(SESSION_API_KEY, acc.apiKey);
  }
}

export function getActiveAccount(): MoltbookAccount | null {
  if (typeof window === "undefined") return null;
  const id = getActiveAccountId();
  if (!id) return null;
  return listAccounts().find((a) => a.id === id) ?? null;
}

// API key used for calls.
export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  const mode = getStorageMode();
  if (mode === "session") {
    return window.sessionStorage.getItem(SESSION_API_KEY);
  }
  // local mode: read from active account entry
  return getActiveAccount()?.apiKey ?? null;
}

export function connectApiKey(params: { label: string; apiKey: string; remember: boolean }) {
  if (typeof window === "undefined") return;
  setStorageMode(params.remember ? "local" : "session");
  const acc = addAccount({ label: params.label, apiKey: params.apiKey });
  setActiveAccountId(acc.id);
  if (!params.remember) {
    window.sessionStorage.setItem(SESSION_API_KEY, params.apiKey);
  }
}

export function clearAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCOUNTS_KEY);
  window.localStorage.removeItem(ACTIVE_ID_KEY);
  window.localStorage.removeItem(MODE_KEY);
  window.sessionStorage.removeItem(SESSION_API_KEY);
}
