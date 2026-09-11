"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

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
