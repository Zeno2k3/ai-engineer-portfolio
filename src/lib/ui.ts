// Class dùng chung cho link, nút, khung trang — giữ ngôn ngữ "brutalism có kỷ luật" nhất quán.

export const containerClass = "mx-auto w-full max-w-page px-5";

export const linkClass =
  "inline-flex w-fit items-center gap-1.5 py-1 font-mono text-sm text-accent underline-offset-4 transition-colors hover:text-accent-2 hover:underline";

const buttonBase =
  "inline-flex h-11 items-center justify-center gap-2 border-2 border-fg px-5 font-mono text-sm font-semibold hard-shadow-sm";

export const buttonPrimary = `${buttonBase} bg-accent-strong text-on-accent`;
export const buttonSecondary = `${buttonBase} bg-surface text-fg`;

export const eyebrowClass = "font-mono text-xs uppercase tracking-widest text-accent";
