"use client";

import { useActionState, useRef } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { sendContact, type ContactState } from "@/app/contact/actions";
import { buttonPrimary } from "@/lib/ui";

const initialState: ContactState = { status: "idle", message: "" };

const inputClass =
  "mt-2 w-full border-2 border-border-strong bg-bg px-4 py-3 text-base text-fg placeholder:text-subtle focus:border-fg focus:outline-none aria-invalid:border-accent-2";

/** `emailParts` = [tên, domain] để hiện email dự phòng dạng che ("ten [at] domain") khi server lỗi. */
export function ContactForm({ emailParts }: { emailParts: [string, string] | null }) {
  const [state, formAction, pending] = useActionState(sendContact, initialState);
  const startedAt = useRef<HTMLInputElement>(null);
  const values = state.fields;

  // Ghi thời điểm người dùng bắt đầu tương tác (dùng để lọc bot gửi ngay lập tức).
  function markStart() {
    if (startedAt.current && !startedAt.current.value) startedAt.current.value = String(Date.now());
  }

  return (
    <form action={formAction} onFocusCapture={markStart} className="space-y-6" noValidate>
      <input ref={startedAt} type="hidden" name="startedAt" />
      {/* Honeypot: ẩn khỏi người dùng và screen reader */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Công ty
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {(["name", "email"] as const).map((field) => (
        <div key={field}>
          <label htmlFor={`contact-${field}`} className="font-mono text-sm text-fg">
            {field === "name" ? "Tên" : "Email"}
          </label>
          <input
            id={`contact-${field}`}
            name={field}
            type={field === "email" ? "email" : "text"}
            autoComplete={field}
            required
            defaultValue={values?.[field]}
            aria-invalid={state.errors?.[field] ? true : undefined}
            aria-describedby={state.errors?.[field] ? `contact-${field}-error` : undefined}
            className={inputClass}
          />
          {state.errors?.[field] && (
            <p id={`contact-${field}-error`} className="mt-1.5 font-mono text-sm text-accent-2">
              {state.errors[field]}
            </p>
          )}
        </div>
      ))}

      <div>
        <label htmlFor="contact-message" className="font-mono text-sm text-fg">
          Tin nhắn
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          defaultValue={values?.message}
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={state.errors?.message ? "contact-message-error" : undefined}
          className={`${inputClass} leading-relaxed`}
        />
        {state.errors?.message && (
          <p id="contact-message-error" className="mt-1.5 font-mono text-sm text-accent-2">
            {state.errors.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className={`${buttonPrimary} cursor-pointer disabled:opacity-60`}>
        {pending ? "Đang gửi…" : "Gửi tin nhắn"}
      </button>

      <div role="status" aria-live="polite">
        {state.status !== "idle" && (
          <div
            className={`flex gap-3 border-2 p-4 ${state.status === "success" ? "border-fg bg-accent-soft" : "border-accent-2 bg-surface"}`}
          >
            {state.status === "success" ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            ) : (
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-accent-2" aria-hidden />
            )}
            <div>
              <p className="text-fg">{state.message}</p>
              {state.fallback && emailParts && (
                <p className="mt-1 font-mono text-sm text-muted">
                  Bạn có thể gửi trực tiếp tới: {emailParts[0]} [at] {emailParts[1]}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
