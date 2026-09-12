"use client";

import { useEffect, useId, type ComponentProps, type ReactNode } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, X } from "lucide-react";

const buttonBase =
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-strong";

const buttonVariants = {
  primary: "bg-accent-strong text-on-accent hover:opacity-90",
  secondary: "border border-border bg-surface text-fg hover:border-subtle",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "text-red-600 hover:bg-red-500/10 dark:text-red-400",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `${buttonBase} ${buttonVariants[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

// ---------- Thông báo nổi (toast) ----------

export type ToastState = { type: "ok" | "error" | "pending"; text: string } | null;

/** Thông báo thành công tự ẩn sau 6s; lỗi ở lại cho tới khi đóng hoặc có thao tác mới. */
const TOAST_TIMEOUT_MS = 6000;

const toastStyles = {
  ok: { Icon: CircleCheck, border: "border-accent-strong", icon: "text-accent-strong" },
  error: { Icon: CircleAlert, border: "border-red-600 dark:border-red-400", icon: "text-red-600 dark:text-red-400" },
  pending: { Icon: LoaderCircle, border: "border-fg", icon: "text-muted motion-safe:animate-spin" },
};

/**
 * Báo kết quả của mọi thao tác lưu / cập nhật, hiện cố định ở góc màn hình nên
 * thấy được kể cả khi đang cuộn ở cuối form dài.
 */
export function Toast({ state, onDismiss }: { state: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    if (state?.type !== "ok") return;
    const timer = setTimeout(onDismiss, TOAST_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state, onDismiss]);

  const style = state ? toastStyles[state.type] : null;

  return (
    // Vùng live luôn có trong DOM để trình đọc màn hình đọc được nội dung mới.
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end"
    >
      {state && style && (
        <div
          key={`${state.type}-${state.text}`}
          className={`toast-in pointer-events-auto flex max-w-md min-w-0 items-start gap-3 border-2 ${style.border} bg-surface p-4 hard-shadow-static`}
        >
          <style.Icon className={`mt-0.5 size-5 shrink-0 ${style.icon}`} aria-hidden />
          <p className="min-w-0 flex-1 text-sm leading-relaxed font-medium whitespace-pre-line text-fg">{state.text}</p>
          {state.type !== "pending" && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Đóng thông báo"
              className="-m-1 shrink-0 cursor-pointer p-1 text-subtle transition-colors hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[15px] text-fg placeholder:text-subtle transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-strong/30";

function FieldShell({
  id,
  label,
  hint,
  required,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

type FieldProps = { label: string; hint?: string; wrapperClassName?: string };

export function TextField({ label, hint, wrapperClassName, ...props }: ComponentProps<"input"> & FieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} required={props.required} className={wrapperClassName}>
      <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} className={inputClass} {...props} />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  wrapperClassName,
  ...props
}: ComponentProps<"textarea"> & FieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} required={props.required} className={wrapperClassName}>
      <textarea
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputClass} leading-relaxed`}
        {...props}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  wrapperClassName = "",
  ...props
}: Omit<ComponentProps<"input">, "type"> & FieldProps) {
  const id = useId();
  return (
    <div className={`flex items-start gap-3 ${wrapperClassName}`}>
      <input
        id={id}
        type="checkbox"
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-accent-strong"
        {...props}
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-fg">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="mt-0.5 text-xs text-subtle">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  hint,
  wrapperClassName,
  options,
  ...props
}: ComponentProps<"select"> & FieldProps & { options: readonly (string | { value: string; label: string })[] }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} required={props.required} className={wrapperClassName}>
      <select id={id} className={`${inputClass} cursor-pointer`} {...props}>
        {options.map((option) => {
          const { value, label: text } = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}
