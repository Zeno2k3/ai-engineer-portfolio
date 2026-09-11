"use client";

// Ba chế độ: theo hệ điều hành → sáng → tối. Lựa chọn lưu trong localStorage (chỉ là tuỳ chọn hiển thị).

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Mode = "system" | "light" | "dark";

const KEY = "theme";
const EVENT = "theme-change";
const LABELS: Record<Mode, string> = { system: "theo hệ thống", light: "sáng", dark: "tối" };
const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };

function readMode(): Mode {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)");

function applyMode(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && prefersDark().matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as Mode);

  // Ở chế độ "theo hệ thống", đổi theme khi người dùng đổi cài đặt của máy.
  useEffect(() => {
    if (mode !== "system") return;
    const query = prefersDark();
    const onChange = () => applyMode("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  function cycle() {
    const next = NEXT[mode];
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
    applyMode(next);
    window.dispatchEvent(new Event(EVENT));
  }

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Giao diện: ${LABELS[mode]}. Bấm để chuyển sang ${LABELS[NEXT[mode]]}`}
      title={`Giao diện: ${LABELS[mode]}`}
      className="grid size-10 cursor-pointer place-items-center text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}
