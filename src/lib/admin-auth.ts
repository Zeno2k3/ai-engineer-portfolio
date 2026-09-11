"use client";

// Phân quyền admin kiểu PROTOTYPE: mật khẩu (dạng hash) + phiên đăng nhập lưu trong localStorage.
// Không phải bảo mật thật — ai mở DevTools cũng vượt qua được. Chỉ dùng để thử luồng.

import { useSyncExternalStore } from "react";
import { notifyChange, storageGet, storageRemove, storageSet, subscribeStorage } from "@/lib/store";

const PASS_KEY = "portfolio:admin:pass";
const SESSION_KEY = "portfolio:admin:session";

export type AdminStatus = "loading" | "setup" | "locked" | "unlocked";

// FNV-1a: chỉ để không lưu mật khẩu dạng chữ thường, không phải mã hoá an toàn.
function hash(input: string): string {
  let h = 0x811c9dc5;
  for (const ch of `portfolio:${input}`) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function getStatus(): AdminStatus {
  if (!storageGet(PASS_KEY)) return "setup";
  return storageGet(SESSION_KEY) === "1" ? "unlocked" : "locked";
}

export function useAdminStatus(): AdminStatus {
  return useSyncExternalStore(subscribeStorage, getStatus, () => "loading" as AdminStatus);
}

export function createPassword(password: string) {
  storageSet(PASS_KEY, hash(password));
  storageSet(SESSION_KEY, "1");
  notifyChange();
}

export function login(password: string): boolean {
  if (storageGet(PASS_KEY) !== hash(password)) return false;
  storageSet(SESSION_KEY, "1");
  notifyChange();
  return true;
}

export function logout() {
  storageRemove(SESSION_KEY);
  notifyChange();
}

/** Xoá mật khẩu (giữ nguyên dữ liệu) để tạo lại. */
export function resetPassword() {
  storageRemove(PASS_KEY);
  storageRemove(SESSION_KEY);
  notifyChange();
}
